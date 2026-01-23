import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PluginPatch, RegistryPlugin } from '../plugins.data'
import type { Plugin } from 'vitepress'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../data/plugins')
const PATCHES_DIR = join(__dirname, '../../data/patches')
const OUTPUT_DIR = join(__dirname, '../public/api')

function loadPatches(): Map<string, PluginPatch> {
  const patches = new Map<string, PluginPatch>()
  try {
    const files = readdirSync(PATCHES_DIR)
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      try {
        const content = readFileSync(join(PATCHES_DIR, file), 'utf-8')
        const patch: PluginPatch = JSON.parse(content)
        if (patch.packageName) {
          patches.set(patch.packageName, patch)
        }
      } catch (e) {
        console.warn(`Failed to load patch file ${file}:`, e)
      }
    }
  } catch {
    // Patches directory might not exist yet
  }
  return patches
}

function applyPatch(plugin: RegistryPlugin, patch: PluginPatch): RegistryPlugin | null {
  if (patch.exclude?.enabled) {
    return null
  }

  const patched: RegistryPlugin = { ...plugin }
  if (patch.overrides) {
    if (patch.overrides.description !== undefined) {
      patched.description = patch.overrides.description
    }
    if (patch.overrides.links) {
      patched.links = { ...patched.links, ...patch.overrides.links }
    }
    if (patch.overrides.compatibility) {
      patched.compatibility = { ...patched.compatibility, ...patch.overrides.compatibility }
    }
  }
  return patched
}

function loadPlugins(): RegistryPlugin[] {
  let plugins: RegistryPlugin[]
  try {
    const filePath = join(DATA_DIR, 'all.json')
    const content = readFileSync(filePath, 'utf-8')
    plugins = JSON.parse(content)
  } catch {
    return []
  }

  const patches = loadPatches()
  const patchedPlugins = plugins
    .map((plugin) => {
      const patch = patches.get(plugin.name)
      if (!patch) return plugin
      return applyPatch(plugin, patch)
    })
    .filter((p): p is RegistryPlugin => p !== null)

  patchedPlugins.sort((a, b) => (b.weeklyDownloads ?? 0) - (a.weeklyDownloads ?? 0))
  return patchedPlugins
}

interface PluginsApiResponse {
  plugins: RegistryPlugin[]
  lastUpdated: string
}

async function generatePluginData(): Promise<PluginsApiResponse> {
  const plugins = loadPlugins()

  return {
    plugins,
    lastUpdated: new Date().toISOString(),
  }
}

interface PluginBadge {
  vite: string
  rollup: string
  rolldown: string
}

function formatCompatibility(
  compat: RegistryPlugin['compatibility'][keyof RegistryPlugin['compatibility']],
): string {
  return compat.type === 'compatible' ? compat.versions : compat.type
}

function generateBadgesData(plugins: RegistryPlugin[]): Record<string, PluginBadge> {
  const badges: Record<string, PluginBadge> = {}
  for (const plugin of plugins) {
    badges[plugin.name] = {
      vite: formatCompatibility(plugin.compatibility.vite),
      rollup: formatCompatibility(plugin.compatibility.rollup),
      rolldown: formatCompatibility(plugin.compatibility.rolldown),
    }
  }
  return badges
}

async function writePluginData() {
  const data = await generatePluginData()

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  writeFileSync(join(OUTPUT_DIR, 'plugins.json'), JSON.stringify(data))
  writeFileSync(
    join(OUTPUT_DIR, 'plugin-badges.json'),
    JSON.stringify(generateBadgesData(data.plugins)),
  )
  console.log('[generate-plugins-api] Generated /api/plugins.json, /api/plugin-badges.json')
}

export function generatePluginsApi() {
  let ws: { send: (payload: { type: string; event: string }) => void } | undefined

  return {
    name: 'generate-plugins-api',
    configureServer(server) {
      ws = server.ws
    },
    async buildStart() {
      this.addWatchFile(DATA_DIR)
      this.addWatchFile(PATCHES_DIR)
      await writePluginData()
    },
    async watchChange(id) {
      if (id.startsWith(DATA_DIR) || id.startsWith(PATCHES_DIR)) {
        await writePluginData()
        ws?.send({ type: 'custom', event: 'plugins-updated' })
      }
    },
  } satisfies Plugin
}

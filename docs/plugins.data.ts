import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../data/plugins')
const PATCHES_DIR = join(__dirname, '../data/patches')

/**
 * Fetch the latest version of a package from npm
 */
async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`)
    if (!response.ok) return ''
    const data = await response.json()
    const version = data.version as string
    return version
  } catch {
    return ''
  }
}

export type ToolCompatibility =
  | { type: 'compatible'; versions: string; note?: string }
  | { type: 'incompatible'; reason: string }
  | { type: 'unknown' }

export interface RegistryPlugin {
  name: string
  description: string
  keywords: string[]
  links: {
    npm: string
    repository?: string
    homepage?: string
  }
  version: string
  updatedAt: string
  compatibility: {
    vite: ToolCompatibility
    rollup: ToolCompatibility
    rolldown: ToolCompatibility
  }
  weeklyDownloads?: number
}

/**
 * Patch file schema for overriding/adding plugin information
 */
export interface PluginPatch {
  packageName: string
  overrides?: {
    description?: string
    links?: Partial<RegistryPlugin['links']>
    compatibility?: Partial<RegistryPlugin['compatibility']>
  }
  exclude?: {
    enabled: boolean
    reason: string
  }
}

export interface PluginData {
  plugins: RegistryPlugin[]
  lastUpdated: string
  latestVersions: {
    vite: string
    rollup: string
    rolldown: string
  }
}

/**
 * Load all patches from the patches directory
 */
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

/**
 * Apply a patch to a plugin
 */
function applyPatch(plugin: RegistryPlugin, patch: PluginPatch): RegistryPlugin | null {
  // Check for exclusion
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

export default {
  async load(): Promise<PluginData> {
    const plugins = loadPlugins()

    const [latestVite, latestRollup, latestRolldown] = await Promise.all([
      getLatestVersion('vite'),
      getLatestVersion('rollup'),
      getLatestVersion('rolldown'),
    ])

    return {
      plugins,
      lastUpdated: new Date().toISOString(),
      latestVersions: {
        vite: latestVite || '7.0.0',
        rollup: latestRollup || '4.0.0',
        rolldown: latestRolldown || '1.0.0',
      },
    }
  },
}

declare const data: PluginData
export { data }

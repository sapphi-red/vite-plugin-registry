import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as v from 'valibot'
import { NpmClient } from './npm-client.js'
import { CompatiblePackagesSchema } from '../metadata-schema.js'
import type {
  RegistryPlugin,
  NpmSearchObject,
  NpmPackument,
  Compatibility,
  CompatiblePackages,
} from './types.js'
import { PLUGIN_KEYWORDS, PLUGIN_SCOPES } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../data/plugins')

/**
 * Validate and parse compatiblePackages data from package.json
 */
function validateCompatiblePackages(data: unknown): CompatiblePackages | null {
  const result = v.safeParse(CompatiblePackagesSchema, data)
  return result.success ? result.output : null
}

/**
 * Extract repository URL from various formats
 */
function extractRepositoryUrl(
  repo: { type?: string; url?: string } | undefined,
): string | undefined {
  if (!repo?.url) return undefined

  let url = repo.url
  if (url.startsWith('git+')) {
    url = url.slice(4)
  }
  if (url.endsWith('.git')) {
    url = url.slice(0, -4)
  }
  if (url.startsWith('git://')) {
    url = url.replace('git://', 'https://')
  }
  if (url.startsWith('git@github.com:')) {
    url = url.replace('git@github.com:', 'https://github.com/')
  }
  return url
}

/**
 * Validate that a URL can be parsed and has http or https protocol
 * @param url - The URL string to validate
 * @returns The original URL if valid (parseable and has http/https protocol), undefined otherwise
 */
function validateUrl(url: string | undefined): string | undefined {
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url
    }
    return undefined
  } catch {
    return undefined
  }
}

/**
 * Parse peer dependencies to extract compatibility info
 */
function parseCompatibility(peerDeps: Record<string, string> | undefined): Compatibility {
  return {
    vite: peerDeps?.vite ? { type: 'compatible', versions: peerDeps.vite } : { type: 'unknown' },
    rollup: peerDeps?.rollup
      ? { type: 'compatible', versions: peerDeps.rollup }
      : { type: 'unknown' },
    rolldown: peerDeps?.rolldown
      ? { type: 'compatible', versions: peerDeps.rolldown }
      : { type: 'unknown' },
  }
}

/**
 * Merge compatiblePackages into base compatibility
 */
function mergeCompatibility(
  base: Compatibility,
  compatiblePackages: CompatiblePackages | undefined,
): Compatibility {
  if (!compatiblePackages) return base

  const result: Compatibility = { ...base }
  const tools = ['vite', 'rollup', 'rolldown'] as const
  for (const tool of tools) {
    const extendedTool = compatiblePackages[tool]
    if (extendedTool) {
      result[tool] = extendedTool
    }
  }
  return result
}

/**
 * Transform npm data to registry plugin format
 */
function transformToRegistryPlugin(
  searchResult: NpmSearchObject,
  packument: NpmPackument,
  compatiblePackages: CompatiblePackages | null,
): RegistryPlugin {
  const latestVersion = packument['dist-tags'].latest
  const versionData = packument.versions[latestVersion]
  const baseCompatibility = parseCompatibility(versionData?.peerDependencies)
  const compatibility = mergeCompatibility(baseCompatibility, compatiblePackages ?? undefined)

  // Validate npm URL (required field)
  const npmUrl = searchResult.package.links.npm
  const validatedNpmUrl = validateUrl(npmUrl)
  if (!validatedNpmUrl) {
    console.warn(`Warning: Invalid npm URL for ${searchResult.package.name}: ${npmUrl}`)
  }

  return {
    name: searchResult.package.name,
    description: searchResult.package.description ?? '',
    keywords: searchResult.package.keywords ?? [],
    links: {
      npm: validatedNpmUrl ?? npmUrl,
      repository: validateUrl(
        extractRepositoryUrl(versionData?.repository) ?? searchResult.package.links.repository,
      ),
      homepage: validateUrl(versionData?.homepage ?? searchResult.package.links.homepage),
    },
    version: latestVersion,
    updatedAt: packument.time[latestVersion] ?? searchResult.package.date,
    compatibility,
    compatiblePackages: compatiblePackages ?? undefined,
    weeklyDownloads: searchResult.downloads.weekly,
  }
}

/**
 * Process a single package and return plugin data
 */
async function processPackage(
  result: NpmSearchObject,
  npmClient: NpmClient,
): Promise<RegistryPlugin | null> {
  try {
    const packument = await npmClient.getPackage(result.package.name)
    if (!packument) return null

    const latestVersion = packument['dist-tags'].latest
    const versionData = packument.versions[latestVersion]

    // Validate compatiblePackages if present
    const compatiblePackages = versionData?.compatiblePackages
      ? validateCompatiblePackages(versionData.compatiblePackages)
      : null

    return transformToRegistryPlugin(result, packument, compatiblePackages)
  } catch (error) {
    console.error(`Error processing ${result.package.name}:`, error)
    return null
  }
}

/**
 * Collect all plugins from all keywords
 */
async function collectPlugins(npmClient: NpmClient): Promise<RegistryPlugin[]> {
  console.log('Searching for plugins...')

  // Search keywords sequentially to avoid rate limiting
  const seen = new Set<string>()
  const allSearchResults: NpmSearchObject[] = []

  for (const keyword of PLUGIN_KEYWORDS) {
    console.log(`  Searching for "${keyword}"...`)
    const results = await npmClient.searchByKeyword(keyword)
    for (const result of results) {
      if (!seen.has(result.package.name)) {
        seen.add(result.package.name)
        allSearchResults.push(result)
      }
    }
  }

  // Also search for official scoped plugins
  // TODO: remove this after https://github.com/rollup/plugins/pull/1955 is merged
  for (const scope of PLUGIN_SCOPES) {
    console.log(`  Searching for "${scope}"...`)
    const results = await npmClient.searchByScope(scope)
    for (const result of results) {
      if (!seen.has(result.package.name)) {
        seen.add(result.package.name)
        allSearchResults.push(result)
      }
    }
  }

  const total = allSearchResults.length
  console.log(`Found ${total} unique packages`)

  let completed = 0
  const startTime = Date.now()
  const isInteractive = process.stdout.isTTY
  const updateProgress = () => {
    if (!isInteractive) return
    const pct = Math.round((completed / total) * 100)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    process.stdout.write(`\r  Progress: ${completed}/${total} (${pct}%) - ${elapsed}s`)
  }

  const results = await Promise.all(
    allSearchResults.map(async (result) => {
      const plugin = await processPackage(result, npmClient)
      completed++
      updateProgress()
      return plugin
    }),
  )

  // Clear progress line and print final result
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  if (isInteractive) {
    process.stdout.write('\r' + ' '.repeat(60) + '\r')
  }

  const plugins = results.filter((p): p is RegistryPlugin => p !== null)
  console.log(`Collected ${plugins.length} plugins in ${elapsed}s`)

  return plugins
}

/**
 * Save plugins to JSON file
 */
async function savePlugins(plugins: RegistryPlugin[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const outputPath = join(DATA_DIR, 'all.json')
  plugins.sort((a, b) => (a.name > b.name ? 1 : -1))
  await writeFile(outputPath, JSON.stringify(plugins, null, 2))
  console.log(`Saved ${plugins.length} plugins to ${outputPath}`)
}

/**
 * Main collection function
 */
async function main(): Promise<void> {
  console.log('Starting plugin collection...')

  const npmClient = new NpmClient()
  const plugins = await collectPlugins(npmClient)
  await savePlugins(plugins)

  console.log('\nCollection complete!')
}

main().catch((error) => {
  console.error('Collection failed:', error)
  process.exit(1)
})

import PQueue from 'p-queue'
import type { VitePluginRegistryMetadata } from './types.js'

/**
 * Fetches and validates custom metadata from URLs specified in package.json
 */
export class MetadataFetcher {
  private readonly queue = new PQueue({ concurrency: 5 })
  private readonly timeoutMs = 5000
  private readonly cache = new Map<string, VitePluginRegistryMetadata | null>()

  /**
   * Fetch metadata from a URL
   */
  async fetch(url: string): Promise<VitePluginRegistryMetadata | null> {
    if (this.cache.has(url)) {
      return this.cache.get(url) ?? null
    }

    const result = await this.queue.add(async () => {
      try {
        const parsedUrl = new URL(url)

        if (parsedUrl.protocol !== 'https:') {
          console.warn(`Metadata URL must be HTTPS: ${url}`)
          return null
        }

        const response = await fetch(url, {
          signal: AbortSignal.timeout(this.timeoutMs),
          headers: {
            Accept: 'application/json',
            'User-Agent': 'vite-plugin-registry/1.0',
          },
        })
        if (!response.ok) {
          console.warn(`Metadata fetch failed for ${url}: ${response.status}`)
          return null
        }

        const data = await response.json()
        if (!this.validate(data)) {
          console.warn(`Invalid metadata format from ${url}`)
          return null
        }

        return data
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn(`Metadata fetch timed out for ${url}`)
          } else {
            console.warn(`Metadata fetch error for ${url}: ${error.message}`)
          }
        }
        return null
      }
    })

    this.cache.set(url, result)
    return result
  }

  /**
   * Validate metadata against the expected schema
   */
  private validate(data: unknown): data is VitePluginRegistryMetadata {
    if (typeof data !== 'object' || data === null) {
      return false
    }

    const obj = data as Record<string, unknown>

    // schemaVersion is required
    if (obj.schemaVersion !== '1.0') {
      return false
    }

    // compatibility must have valid structure if present
    if (obj.compatibility !== undefined) {
      if (typeof obj.compatibility !== 'object' || obj.compatibility === null) {
        return false
      }
      const compat = obj.compatibility as Record<string, unknown>
      for (const tool of ['vite', 'rollup', 'rolldown']) {
        if (compat[tool] !== undefined) {
          if (typeof compat[tool] !== 'object' || compat[tool] === null) {
            return false
          }
          const toolCompat = compat[tool] as Record<string, unknown>
          if (typeof toolCompat.versions !== 'string') {
            return false
          }
          // Validate nested incompatibilities if present
          if (toolCompat.incompatibilities !== undefined) {
            if (!Array.isArray(toolCompat.incompatibilities)) {
              return false
            }
            for (const incompat of toolCompat.incompatibilities) {
              if (typeof incompat !== 'object' || incompat === null) {
                return false
              }
              const inc = incompat as Record<string, unknown>
              if (typeof inc.reason !== 'string') {
                return false
              }
            }
          }
        }
      }
    }

    return true
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

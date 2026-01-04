import PQueue from 'p-queue'
import type { NpmSearchResponse, NpmSearchObject, NpmPackument } from './types.js'
import { setTimeout } from 'node:timers/promises'

/**
 * Rate-limited npm registry API client
 */
export class NpmClient {
  private readonly registryUrl = 'https://registry.npmjs.org'
  private readonly queue = new PQueue({ concurrency: 30 })
  private readonly maxRetries = 100

  /**
   * Search for packages by keyword
   */
  async searchByKeyword(
    keyword: string,
    options: { maxResults?: number } = {},
  ): Promise<NpmSearchObject[]> {
    const maxResults = options.maxResults ?? 2000
    const pageSize = 250 // npm max is 250
    const allResults: NpmSearchObject[] = []

    let from = 0
    while (from < maxResults) {
      const result = await this.queue.add(async () => {
        return this.fetchWithRetry<NpmSearchResponse>(async () => {
          const url = new URL('/-/v1/search', this.registryUrl)
          url.searchParams.set('text', `keywords:${keyword}`)
          url.searchParams.set('size', String(pageSize))
          url.searchParams.set('from', String(from))

          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`Search failed: ${response.status} ${response.statusText}`)
          }
          return { data: await response.json(), response }
        })
      })

      allResults.push(...result.objects)

      if (result.objects.length < pageSize || allResults.length >= result.total) {
        break
      }
      from += pageSize
    }

    return allResults
  }

  /**
   * Search for packages by scope/prefix (e.g., "@rollup/plugin-")
   */
  async searchByScope(
    scope: string,
    options: { maxResults?: number } = {},
  ): Promise<NpmSearchObject[]> {
    const maxResults = options.maxResults ?? 500
    const pageSize = 250
    const allResults: NpmSearchObject[] = []

    let from = 0
    while (from < maxResults) {
      const result = await this.queue.add(async () => {
        return this.fetchWithRetry<NpmSearchResponse>(async () => {
          const url = new URL('/-/v1/search', this.registryUrl)
          url.searchParams.set('text', scope)
          url.searchParams.set('size', String(pageSize))
          url.searchParams.set('from', String(from))

          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`Search failed: ${response.status} ${response.statusText}`)
          }
          return { data: await response.json(), response }
        })
      })

      // Filter to only include packages that start with the scope
      const filtered = result.objects.filter((obj) => obj.package.name.startsWith(scope))
      allResults.push(...filtered)

      if (result.objects.length < pageSize || allResults.length >= result.total) {
        break
      }
      from += pageSize
    }

    return allResults
  }

  /**
   * Get full package document (packument) from registry
   */
  async getPackage(name: string): Promise<NpmPackument | null> {
    return this.queue.add(async () => {
      return this.fetchWithRetry<NpmPackument | null>(async () => {
        const url = `${this.registryUrl}/${name}`
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        })

        if (response.status === 404) {
          return { data: null, response }
        }

        if (!response.ok) {
          throw new Error(`Package fetch failed: ${response.status} ${response.statusText}`)
        }

        return { data: await response.json(), response }
      })
    })
  }

  /**
   * Fetch with retry and exponential backoff
   */
  private async fetchWithRetry<T>(
    fn: () => Promise<{ data: T; response: Response }>,
    retries = this.maxRetries,
  ): Promise<T> {
    let lastError: Error | undefined
    let attempt = 0
    let rateLimitBackoff = 0

    while (attempt < retries) {
      try {
        const { data } = await fn()
        return data
      } catch (error) {
        lastError = error as Error
        const isRateLimited = lastError.message.includes('429')

        if (isRateLimited) {
          rateLimitBackoff++
          const backoffMs = Math.min(500 * Math.pow(2, rateLimitBackoff), 60000)
          console.warn(`Rate limited, pausing queue for ${backoffMs}ms`)
          this.queue.pause()
          await setTimeout(backoffMs)
          this.queue.start()
        } else {
          attempt++
          if (attempt < retries) {
            const backoffMs = 100 * attempt
            await setTimeout(backoffMs)
          }
        }
      }
    }

    throw lastError ?? new Error('Unknown fetch error')
  }
}

/**
 * Links associated with a plugin
 */
export interface PluginLinks {
  /** npm package page URL */
  npm: string
  /** Source code repository URL */
  repository?: string
  /** Project homepage URL */
  homepage?: string
}

/**
 * Compatibility information for a specific tool.
 */
export type ToolCompatibility =
  | { type: 'compatible'; versions: string; note?: string }
  | { type: 'incompatible'; reason: string }
  | { type: 'unknown' }

/**
 * Compatibility information extracted from peer dependencies
 */
export interface Compatibility {
  /** Vite compatibility information */
  vite: ToolCompatibility
  /** Rollup compatibility information */
  rollup: ToolCompatibility
  /** Rolldown compatibility information */
  rolldown: ToolCompatibility
}

/**
 * Custom metadata from the `vite-plugin-registry` field in package.json
 * This is fetched from an external URL
 */
export interface VitePluginRegistryMetadata {
  /** Schema version for forward compatibility */
  schemaVersion: '1.0'
  /** Overall compatibility declarations */
  compatibility?: {
    vite?: ToolCompatibility
    rollup?: ToolCompatibility
    rolldown?: ToolCompatibility
  }
}

/**
 * Plugin data as stored in the registry JSON files
 */
export interface RegistryPlugin {
  /** npm package name */
  name: string
  /** Package description */
  description: string
  /** All npm keywords */
  keywords: string[]
  /** Associated links */
  links: PluginLinks
  /** Latest version */
  version: string
  /** ISO date of last publish */
  updatedAt: string
  /** Compatibility information from peer dependencies */
  compatibility: Compatibility
  /** Extended metadata from vite-plugin-registry field */
  extendedMetadata?: VitePluginRegistryMetadata
  /** Weekly download count from npm */
  weeklyDownloads?: number
}

// npm API response types

/**
 * npm search API result object
 */
export interface NpmSearchObject {
  package: {
    name: string
    version: string
    description?: string
    keywords?: string[]
    date: string
    links: {
      npm: string
      homepage?: string
      repository?: string
    }
    publisher: {
      username: string
      email?: string
    }
  }
  score: {
    final: number
    detail: {
      quality: number
      popularity: number
      maintenance: number
    }
  }
  downloads: {
    weekly: number
  }
}

/**
 * npm search API response
 */
export interface NpmSearchResponse {
  objects: NpmSearchObject[]
  total: number
  time: string
}

/**
 * npm registry packument (package document)
 */
export interface NpmPackument {
  name: string
  'dist-tags': {
    latest: string
    [tag: string]: string
  }
  versions: {
    [version: string]: {
      name: string
      version: string
      description?: string
      keywords?: string[]
      repository?: {
        type?: string
        url?: string
      }
      peerDependencies?: Record<string, string>
      homepage?: string
      'vite-plugin-registry'?: string
    }
  }
  time: {
    created: string
    modified: string
    [version: string]: string
  }
}

/**
 * Keywords used to discover plugins
 */
export const PLUGIN_KEYWORDS = [
  'vite-plugin',
  'rollup-plugin',
  'rolldown-plugin',
  'unplugin',
] as const

/**
 * Scopes to search for official plugins
 */
export const PLUGIN_SCOPES = ['@rollup/plugin-'] as const

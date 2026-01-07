import * as v from 'valibot'

export const ToolCompatibilitySchema = v.variant('type', [
  v.object({
    type: v.literal('compatible'),
    versions: v.pipe(v.string(), v.description('Semver range of compatible versions')),
    note: v.optional(
      v.pipe(
        v.string(),
        v.description('Optional note providing additional context about compatibility'),
      ),
    ),
  }),
  v.object({
    type: v.literal('incompatible'),
    reason: v.pipe(
      v.string(),
      v.description('Human-readable explanation of why the plugin is incompatible'),
    ),
  }),
  v.object({
    type: v.literal('unknown'),
  }),
])

export const CompatiblePackagesSchema = v.pipe(
  v.object({
    schemaVersion: v.pipe(v.literal(1), v.description('Schema version for forward compatibility')),
    vite: v.optional(ToolCompatibilitySchema),
    rollup: v.optional(ToolCompatibilitySchema),
    rolldown: v.optional(ToolCompatibilitySchema),
  }),
  v.description(
    'Schema for the compatiblePackages field in package.json, declaring plugin compatibility with bundlers',
  ),
)

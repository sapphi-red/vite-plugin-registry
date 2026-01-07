import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { toJsonSchema } from '@valibot/to-json-schema'
import { CompatiblePackagesSchema, ToolCompatibilitySchema } from './metadata-schema.js'

const OUTPUT_PATH = 'data/schema/compatible-packages.schema.json'

const rawSchema = toJsonSchema(CompatiblePackagesSchema, {
  definitions: {
    ToolCompatibilitySchema,
  },
})
rawSchema.$id =
  'https://raw.githubusercontent.com/vitejs/vite-plugin-registry/refs/heads/main/data/schema/compatible-packages.schema.json'
rawSchema.title = 'Compatible Packages Schema'

const output = JSON.stringify(rawSchema, null, 2) + '\n'

const isVerify = process.argv.includes('--verify')
if (isVerify) {
  if (!existsSync(OUTPUT_PATH)) {
    console.error(`Schema file not found: ${OUTPUT_PATH}`)
    process.exit(1)
  }

  const existing = readFileSync(OUTPUT_PATH, 'utf-8')
  const formattedExisting = JSON.stringify(JSON.parse(existing), null, 2) + '\n'
  if (formattedExisting !== output) {
    console.error('Schema is outdated. Run `pnpm run generate-schema` to update.')
    process.exit(1)
  }

  console.log('Schema is up to date.')
} else {
  writeFileSync(OUTPUT_PATH, output)
  console.log(`Schema written to ${OUTPUT_PATH}`)
}

# Registry Patches

For plugins that don't provide their own metadata, the registry maintainers can add patches. If you'd like to update information for your plugin, you can:

1. Add the `vite-plugin-registry` field to your `package.json` (preferred)
2. Submit a PR to add a patch file in the `data/patches/` directory

::: warning

Patches are only intended as a temporary solution. We recommend for plugins to provide their own metadata instead.

:::

## Patch File Format

```json
{
  "packageName": "@scope/plugin-name",
  "overrides": {
    "compatibility": {
      "vite": {
        "type": "incompatible",
        "reason": "Vite has built-in support for this feature."
      }
    }
  }
}
```

## Fields

### Required

| Field         | Type     | Description                   |
| ------------- | -------- | ----------------------------- |
| `packageName` | `string` | The npm package name to patch |

### Optional

| Field       | Type     | Description                                |
| ----------- | -------- | ------------------------------------------ |
| `overrides` | `object` | Properties to override from collected data |
| `exclude`   | `object` | Remove plugin from registry entirely       |

### Overrides

The `overrides` object can contain:

| Field           | Type     | Description                        |
| --------------- | -------- | ---------------------------------- |
| `description`   | `string` | Override the plugin description    |
| `links`         | `object` | Override npm, repository, homepage |
| `compatibility` | `object` | Override compatibility per tool    |

Each tool in `compatibility` uses a discriminated union:

```typescript
// Compatible with specific versions
{ type: 'compatible', versions: '^5.0.0' }

// Incompatible with this tool
{ type: 'incompatible', reason: 'Explanation' }

// Compatibility unknown
{ type: 'unknown' }
```

## Exclude Example

To exclude a plugin from the registry:

```json
{
  "packageName": "problematic-plugin",
  "exclude": {
    "enabled": true,
    "reason": "Security vulnerability - do not use"
  }
}
```

## Contributing Patches

1. Create a JSON file in `data/patches/` named after the package (e.g., `@scope-plugin-name.json`)
2. Follow the patch file format above
3. Submit a pull request with a clear explanation

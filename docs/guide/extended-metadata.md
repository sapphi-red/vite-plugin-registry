# Extended Metadata

For additional metadata beyond peer dependencies, you can add a `compatiblePackages` field to your `package.json`. This field contains compatibility information for your plugin.

## Quick Start

Add the `compatiblePackages` field to your `package.json`:

```json [package.json]
{
  "name": "my-vite-plugin",
  "version": "1.0.0",
  "$schema": "https://raw.githubusercontent.com/vitejs/vite-plugin-registry/refs/heads/main/data/schema/extended-package-json.schema.json",
  "compatiblePackages": {
    "schemaVersion": 1,
    "vite": { "type": "compatible", "versions": "^5.0.0 || ^6.0.0" }
  }
}
```

## Schema

The `compatiblePackages` object uses a discriminated union for each tool. Each tool can have one of three states:

```typescript
{
  vite?: ToolCompatibility;
  rollup?: ToolCompatibility;
  rolldown?: ToolCompatibility;
}
```

#### ToolCompatibility Union

Each tool's compatibility is expressed as one of:

| Type           | Required Fields    | Optional Fields | Description                           |
| -------------- | ------------------ | --------------- | ------------------------------------- |
| `compatible`   | `type`, `versions` | `note`          | Plugin works with specified versions  |
| `incompatible` | `type`, `reason`   |                 | Plugin does not work with this tool   |
| `unknown`      | `type`             |                 | Compatibility has not been determined |

The optional `note` field for `compatible` entries allows you to provide additional context. When present, an info icon will appear next to the version string, showing the note on hover.

**Examples:**

```json
{
  "compatiblePackages": {
    "schemaVersion": 1,
    "vite": {
      "type": "compatible",
      "versions": "^5.0.0 || ^6.0.0"
    },
    "rollup": {
      "type": "compatible",
      "versions": "^4.0.0",
      "note": "HMR support is Vite-only"
    },
    "rolldown": {
      "type": "incompatible",
      "reason": "Rolldown has built-in support for this feature."
    }
  }
}
```

## Complete Example

Here's a complete `package.json` with compatibility metadata:

```json
{
  "name": "my-vite-plugin",
  "version": "1.0.0",
  "$schema": "https://raw.githubusercontent.com/vitejs/vite-plugin-registry/refs/heads/main/data/schema/extended-package-json.schema.json",
  "compatiblePackages": {
    "schemaVersion": 1,
    "vite": {
      "type": "compatible",
      "versions": "^5.0.0 || ^6.0.0 || ^7.0.0"
    },
    "rollup": {
      "type": "compatible",
      "versions": "^4.0.0"
    }
  }
}
```

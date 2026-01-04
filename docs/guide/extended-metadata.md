# Extended Metadata

For additional metadata beyond peer dependencies, you can add a `vite-plugin-registry` field to your `package.json`. This field should contain a URL pointing to a JSON file with extended metadata.

## Quick Start

1. Add the `vite-plugin-registry` field to your `package.json`:

```json [package.json]
{
  "name": "my-vite-plugin",
  "version": "1.0.0",
  "vite-plugin-registry": "https://example.com/registry-metadata.json"
}
```

2. Host a JSON file at that URL with your plugin's metadata:

```json [registry-metadata.json]
{
  "schemaVersion": "1.0",
  "compatibility": {
    "vite": { "type": "compatible", "versions": "^5.0.0 || ^6.0.0" }
  }
}
```

## Schema

### Root Object

| Field           | Type     | Required | Description                              |
| --------------- | -------- | -------- | ---------------------------------------- |
| `schemaVersion` | `"1.0"`  | Yes      | Schema version for forward compatibility |
| `compatibility` | `object` | No       | Overall compatibility declarations       |

### Compatibility Object

The compatibility object uses a discriminated union for each tool. Each tool can have one of three states:

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
  "compatibility": {
    "vite": {
      "type": "compatible",
      "versions": "^5.0.0 || ^6.0.0"
    },
    "rollup": {
      "type": "compatible",
      "versions": "^4.0.0",
      "note": "Requires Node.js 18+ for full functionality"
    },
    "rolldown": {
      "type": "incompatible",
      "reason": "Rolldown has built-in support for this feature."
    }
  }
}
```

## Complete Example

Here's a complete metadata file:

```json
{
  "schemaVersion": "1.0",
  "compatibility": {
    "vite": {
      "type": "compatible",
      "versions": "^5.0.0 || ^6.0.0 || ^7.0.0"
    },
    "rollup": {
      "type": "compatible",
      "versions": "^4.0.0"
    },
    "rolldown": {
      "type": "unknown"
    }
  }
}
```

## Hosting Your Metadata

The metadata URL must:

- Use HTTPS
- Return valid JSON
- Respond within 5 seconds
- Be publicly accessible

**Recommended locations:**

- GitHub raw files: `https://raw.githubusercontent.com/user/repo/main/registry.json`
- Project documentation site
- npm package files (via unpkg/jsdelivr): `https://unpkg.com/your-package/registry.json`

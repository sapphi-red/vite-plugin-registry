# Compatibility Detection

The registry automatically extracts compatibility information from your plugin's `peerDependencies` in `package.json`. This is the primary way compatibility is determined.

```json [package.json]
{
  "name": "my-vite-plugin",
  "peerDependencies": {
    "vite": "^5.0.0 || ^6.0.0",
    "rollup": "^4.0.0"
  }
}
```

From this, the registry will show:

- **Vite:** ^5.0.0 || ^6.0.0
- **Rollup:** ^4.0.0

If no peer dependency is declared for a tool, compatibility will be shown as "unknown" and the plugin will be filtered out when users filter by that tool's version.

You can also declare the compatibility by the extended metadata feature. See [Extended Metadata](./extended-metadata.md) for more details.

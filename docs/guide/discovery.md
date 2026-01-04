# Plugin Discovery

The registry discovers plugins from npm based on keywords in your `package.json`.

## Required Keywords

Make sure your `package.json` includes the appropriate keyword:

- `vite-plugin` ([Vite conventions](https://vite.dev/guide/api-plugin#conventions))
- `rollup-plugin` ([Rollup conventions](https://rollupjs.org/plugin-development/#conventions))
- `rolldown-plugin`
- `unplugin` ([unplugin conventions](https://unplugin.unjs.io/guide/plugin-conventions.html))

## Example

```json [package.json]
{
  "name": "vite-plugin-example",
  "keywords": ["vite-plugin"]
}
```

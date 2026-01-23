# Compatibility Badges

Vite Plugin Registry supports generating compatibility badges for your plugin in README files, documentation, or anywhere that supports images. These badges dynamically show which versions of Vite, Rollup, or Rolldown your plugin supports.

## Overview

The Vite Plugin Registry provides badge endpoints powered by [shields.io](https://shields.io) that display real-time compatibility information for any registered plugin.

**Example badge:**

![Vite compatibility](https://registry.vite.dev/api/badges?package=@vitejs/plugin-vue&tool=vite)

## Usage

Add a badge to your README using standard Markdown image syntax:

```markdown
![Vite compatibility](https://registry.vite.dev/api/badges?package=@vitejs/plugin-vue&tool=vite)
```

### URL Format

```
https://registry.vite.dev/api/badges?package=<package-name>&tool=<tool>
```

**Parameters:**

| Parameter | Description                        | Values                                       |
| --------- | ---------------------------------- | -------------------------------------------- |
| `package` | The npm package name               | e.g. `@vitejs/plugin-vue`, `vite-plugin-pwa` |
| `tool`    | The tool to show compatibility for | `vite`, `rollup`, `rolldown`                 |

### Examples

**Vite compatibility:**

```markdown
![Vite compatibility](https://registry.vite.dev/api/badges?package=@vitejs/plugin-vue&tool=vite)
```

![Vite compatibility](https://registry.vite.dev/api/badges?package=@vitejs/plugin-vue&tool=vite)

**Rollup compatibility:**

```markdown
![Rollup compatibility](https://registry.vite.dev/api/badges?package=@rollup/plugin-node-resolve&tool=rollup)
```

![Rollup compatibility](https://registry.vite.dev/api/badges?package=@rollup/plugin-node-resolve&tool=rollup)

**Rolldown compatibility:**

```markdown
![Rolldown compatibility](https://registry.vite.dev/api/badges?package=vite-plugin-inspect&tool=rolldown)
```

![Rolldown compatibility](https://registry.vite.dev/api/badges?package=vite-plugin-inspect&tool=rolldown)

## Badge Generator

Use this tool to generate the badge markdown for your plugin:

<BadgeGenerator />

<script setup>
import BadgeGenerator from '../.vitepress/theme/components/BadgeGenerator.vue'
</script>

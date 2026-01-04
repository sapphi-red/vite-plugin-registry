# Plugin Registry Guide

This guide explains how plugins are discovered, how compatibility is detected, and how to provide enhanced metadata for your plugin.

## Quick Summary

To ensure your plugin appears correctly in the registry:

1. **Add the correct keyword** (e.g. `vite-plugin`)
2. **Declare peer dependencies** for tools you support
3. **Follow naming conventions** for your plugin type
4. **(Optional)** Add extended metadata via `vite-plugin-registry` field

## Guide Sections

### [Plugin Discovery](./discovery)

Learn how plugins are found and indexed from npm based on keywords.

### [Compatibility Detection](./compatibility)

Understand how version compatibility is extracted from peer dependencies.

### [Extended Metadata](./extended-metadata)

Add custom metadata to enhance your plugin's registry listing.

### [Registry Patches](./patches)

How registry maintainers can add patches for plugins that don't provide their own metadata.

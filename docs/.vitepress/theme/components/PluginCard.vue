<script setup lang="ts">
import type { RegistryPlugin } from '../../../plugins.data'
import IconAlertTriangle from '~icons/lucide/alert-triangle'
import IconInfo from '~icons/lucide/info'
import IconX from '~icons/lucide/x'
import IconBadgeCheck from '~icons/lucide/badge-check'
import { computed } from 'vue'

const props = defineProps<{
  plugin: RegistryPlugin
}>()

const officialPlugin = computed(() => {
  if (props.plugin.name.startsWith('@vitejs/')) {
    return {
      type: 'vitejs',
      color: 'purple',
      tooltip: 'This plugin is an official plugin published by the Vite team',
    }
  }
  if (props.plugin.name.startsWith('@rolldown/')) {
    return {
      type: 'rolldown',
      color: 'orange',
      tooltip: 'This plugin is an official plugin published by the Rolldown team',
    }
  }
  if (props.plugin.name.startsWith('@rollup/')) {
    return {
      type: 'rollup',
      color: 'red',
      tooltip: 'This plugin is an official plugin published by the Rollup team',
    }
  }
  return null
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate))
}

function formatDownloads(count: number): string {
  return compactNumberFormatter.format(count)
}
</script>

<template>
  <article class="plugin-card">
    <header class="plugin-card-header">
      <div class="plugin-name-wrapper">
        <a :href="plugin.links.npm" target="_blank" rel="noopener" class="plugin-name-link">
          <h3 class="plugin-name">{{ plugin.name }}</h3>
        </a>
        <span
          v-if="officialPlugin"
          v-tooltip="officialPlugin.tooltip"
          class="official-badge"
          :class="`official-badge-${officialPlugin.color}`"
        >
          <IconBadgeCheck />
        </span>
      </div>
      <div class="plugin-badges">
        <span class="badge badge-version">v{{ plugin.version }}</span>
      </div>
    </header>

    <p class="plugin-description">{{ plugin.description || 'No description available.' }}</p>

    <div class="plugin-compatibility">
      <div v-for="(compat, tool) in plugin.compatibility" :key="tool" class="compat-tool">
        <span
          v-if="compat.type === 'compatible'"
          class="compat-item"
          :class="compat.note ? 'compat-has-note' : 'compat-compatible'"
        >
          <strong>{{ tool }}:</strong> {{ compat.versions }}
          <span v-if="compat.note" v-tooltip="compat.note" class="compat-note-icon">
            <IconInfo />
          </span>
        </span>
        <span v-else-if="compat.type === 'incompatible'" class="compat-item compat-incompatible">
          <strong>{{ tool }}:</strong> <IconX class="compat-x-icon" /> {{ compat.reason }}
        </span>
        <span v-else class="compat-item compat-unknown">
          <strong>{{ tool }}:</strong> <IconAlertTriangle class="compat-warning-icon" /> unknown
        </span>
      </div>
    </div>

    <footer class="plugin-footer">
      <div class="plugin-links">
        <a
          v-if="plugin.links.repository"
          :href="plugin.links.repository"
          target="_blank"
          rel="noopener"
          class="plugin-link"
        >
          Repository
        </a>
        <a
          v-if="plugin.links.homepage"
          :href="plugin.links.homepage"
          target="_blank"
          rel="noopener"
          class="plugin-link"
        >
          Homepage
        </a>
      </div>
      <div class="plugin-meta">
        <span v-if="plugin.weeklyDownloads !== undefined">
          {{ formatDownloads(plugin.weeklyDownloads) }}/week
        </span>
        <span>{{ formatDate(plugin.updatedAt) }}</span>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.plugin-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg);
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}

.plugin-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.plugin-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.plugin-name-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.plugin-name-link {
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.plugin-name-link:hover .plugin-name {
  color: var(--vp-c-brand-1);
}

.plugin-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  word-break: break-word;
  transition: color 0.25s;
}

.official-badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: help;
  transition: opacity 0.2s;
}

.official-badge:hover {
  opacity: 0.8;
}

.official-badge svg {
  width: 1.2rem;
  height: 1.2rem;
}

.official-badge-purple {
  color: #a855f7;
}

.official-badge-orange {
  color: #f97316;
}

.official-badge-red {
  color: #ef4444;
}

.plugin-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
}

.badge-version {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.plugin-description {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plugin-compatibility {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.compat-tool {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.compat-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  color: var(--vp-c-text-2);
}

.compat-item strong {
  color: var(--vp-c-text-1);
  text-transform: capitalize;
}

.compat-unknown {
  background: rgba(255, 200, 0, 0.15);
  font-style: italic;
}

.compat-has-note {
  background: rgba(255, 200, 0, 0.15);
}

.compat-note-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
  color: var(--vp-c-warning-1, #e5a500);
  cursor: help;
  transition: color 0.2s;
}

.compat-note-icon:hover {
  color: var(--vp-c-warning-2, #c99400);
}

.compat-incompatible {
  background: rgba(229, 57, 53, 0.15);
}

.compat-x-icon {
  color: var(--vp-c-danger-1, #e53935);
  flex-shrink: 0;
}

.compat-warning-icon {
  color: var(--vp-c-warning-1, #e5a500);
  flex-shrink: 0;
}

.plugin-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-border);
}

.plugin-links {
  display: flex;
  gap: 0.75rem;
}

.plugin-link {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.25s;
}

.plugin-link:hover {
  color: var(--vp-c-brand-2);
}

.plugin-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
</style>

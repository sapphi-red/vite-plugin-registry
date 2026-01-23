<script setup lang="ts">
import { computed, ref } from 'vue'

const packageName = ref('@vitejs/plugin-vue')
const selectedTool = ref<'vite' | 'rollup' | 'rolldown'>('vite')

const tools = [
  { value: 'vite', label: 'Vite' },
  { value: 'rollup', label: 'Rollup' },
  { value: 'rolldown', label: 'Rolldown' },
] as const

const badgeUrl = computed(() => {
  const pkg = encodeURIComponent(packageName.value)
  return `https://registry.vite.dev/api/badges?package=${pkg}&tool=${selectedTool.value}`
})

const markdownCode = computed(() => {
  const toolLabel = tools.find((t) => t.value === selectedTool.value)?.label ?? selectedTool.value
  return `![${toolLabel} compatibility](${badgeUrl.value})`
})

const copied = ref(false)

async function copyToClipboard() {
  await navigator.clipboard.writeText(markdownCode.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="badge-generator">
    <div class="input-group">
      <label for="package-name">Package name</label>
      <input
        id="package-name"
        v-model="packageName"
        type="text"
        placeholder="e.g. @vitejs/plugin-vue"
      />
    </div>

    <div class="input-group">
      <label>Tool</label>
      <div class="tool-buttons">
        <button
          v-for="tool in tools"
          :key="tool.value"
          :class="{ active: selectedTool === tool.value }"
          @click="selectedTool = tool.value"
        >
          {{ tool.label }}
        </button>
      </div>
    </div>

    <div class="preview-section">
      <label>Preview</label>
      <div class="badge-preview">
        <img :src="badgeUrl" :alt="`${selectedTool} compatibility badge`" />
      </div>
    </div>

    <div class="code-section">
      <label>Markdown</label>
      <div class="code-container">
        <code class="code-block">{{ markdownCode }}</code>
        <button class="copy-button" :class="{ copied }" @click="copyToClipboard">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-generator {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.input-group input {
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.25s;
}

.input-group input:focus {
  border-color: var(--vp-c-brand-1);
}

.tool-buttons {
  display: flex;
  gap: 0.5rem;
}

.tool-buttons button {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.25s,
    background-color 0.25s,
    color 0.25s;
}

.tool-buttons button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.tool-buttons button.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.preview-section,
.code-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-section label,
.code-section label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.badge-preview {
  display: flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0.75rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
}

.badge-preview img {
  height: 20px;
}

.code-container {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.code-block {
  flex: 1;
  padding: 0.75rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  word-break: break-all;
  white-space: pre-wrap;
}

.copy-button {
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.25s,
    background-color 0.25s,
    color 0.25s;
  white-space: nowrap;
}

.copy-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.copy-button.copied {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

@media (max-width: 480px) {
  .code-container {
    flex-direction: column;
  }

  .copy-button {
    width: 100%;
  }
}
</style>

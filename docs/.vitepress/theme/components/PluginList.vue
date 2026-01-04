<script setup lang="ts">
import { computed, watch } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import * as semver from 'semver';
import { data, type ToolCompatibility } from '../../../plugins.data';
import PluginCard from './PluginCard.vue';

const PLUGINS_PER_PAGE = 100;

const params = useUrlSearchParams('history', {
  initialValue: {
    q: '',
    vite: '',
    rollup: '',
    rolldown: '',
    page: '1',
  },
});

const searchQuery = computed({
  get: () => params.q,
  set: (v) => { params.q = v },
});

const viteVersion = computed({
  get: () => params.vite,
  set: (v) => { params.vite = v },
});

const rollupVersion = computed({
  get: () => params.rollup,
  set: (v) => { params.rollup = v },
});

const rolldownVersion = computed({
  get: () => params.rolldown,
  set: (v) => { params.rolldown = v },
});

const currentPage = computed({
  get: () => {
    const page = parseInt(params.page, 10);
    return isNaN(page) || page < 1 ? 1 : page;
  },
  set: (v) => { params.page = String(v) },
});

/**
 * Check if a plugin is compatible with a given tool version
 * Returns true if compatible, false if incompatible or unknown
 */
function isCompatibleWith(compat: ToolCompatibility, version: string): boolean {
  if (!version) return true; // No filter = show all
  if (compat.type === 'incompatible' || compat.type === 'unknown') return false;

  // type === 'compatible' - check semver range
  const range = compat.versions;
  // Normalize version input (allow "6" to mean "6.0.0")
  const normalizedVersion = version.includes('.') ? version : `${version}.0.0`;

  try {
    return semver.satisfies(normalizedVersion, range);
  } catch {
    // If semver parsing fails, fall back to simple string matching
    return range.includes(version);
  }
}

const plugins = computed(() => {
  let result = data.plugins;
  if (viteVersion.value) {
    result = result.filter((p) => isCompatibleWith(p.compatibility.vite, viteVersion.value));
  }
  if (rollupVersion.value) {
    result = result.filter((p) => isCompatibleWith(p.compatibility.rollup, rollupVersion.value));
  }
  if (rolldownVersion.value) {
    result = result.filter((p) => isCompatibleWith(p.compatibility.rolldown, rolldownVersion.value));
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }
  return result.sort((a, b) => (b.weeklyDownloads ?? 0) - (a.weeklyDownloads ?? 0));
});

const totalPages = computed(() => Math.ceil(plugins.value.length / PLUGINS_PER_PAGE));

const paginatedPlugins = computed(() => {
  const start = (currentPage.value - 1) * PLUGINS_PER_PAGE;
  const end = start + PLUGINS_PER_PAGE;
  return plugins.value.slice(start, end);
});

watch([searchQuery, viteVersion, rollupVersion, rolldownVersion], () => {
  currentPage.value = 1;
});

const stats = computed(() => {
  const total = data.plugins.length;
  const filtered = plugins.value.length;
  const start = (currentPage.value - 1) * PLUGINS_PER_PAGE + 1;
  const end = Math.min(currentPage.value * PLUGINS_PER_PAGE, filtered);
  return { total, filtered, start, end };
});

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const visiblePages = computed(() => {
  const pages: (number | 'ellipsis')[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);
  }
  return pages;
});

const activeFilters = computed(() => {
  const filters: string[] = [];
  if (viteVersion.value) filters.push(`Vite ${viteVersion.value}`);
  if (rollupVersion.value) filters.push(`Rollup ${rollupVersion.value}`);
  if (rolldownVersion.value) filters.push(`Rolldown ${rolldownVersion.value}`);
  return filters;
});
</script>

<template>
  <div class="plugin-list">
    <div class="plugin-search-container">
      <input
        v-model="searchQuery"
        type="text"
        class="plugin-search"
        placeholder="Search plugins by name, description, or keywords..."
        @keydown.escape="searchQuery = ''"
      />
    </div>

    <div class="plugin-filter-row">
      <div class="filter-group">
        <label class="filter-label" for="vite-version">Vite:</label>
        <input
          id="vite-version"
          v-model="viteVersion"
          type="text"
          class="version-input"
          :placeholder="`e.g. ${data.latestVersions.vite}`"
          @keydown.escape="viteVersion = ''"
        />
        <button
          class="latest-btn"
          :class="{ active: viteVersion === data.latestVersions.vite }"
          @click="viteVersion = viteVersion === data.latestVersions.vite ? '' : data.latestVersions.vite"
        >
          Latest
        </button>
      </div>
      <div class="filter-group">
        <label class="filter-label" for="rollup-version">Rollup:</label>
        <input
          id="rollup-version"
          v-model="rollupVersion"
          type="text"
          class="version-input"
          :placeholder="`e.g. ${data.latestVersions.rollup}`"
          @keydown.escape="rollupVersion = ''"
        />
        <button
          class="latest-btn"
          :class="{ active: rollupVersion === data.latestVersions.rollup }"
          @click="rollupVersion = rollupVersion === data.latestVersions.rollup ? '' : data.latestVersions.rollup"
        >
          Latest
        </button>
      </div>
      <div class="filter-group">
        <label class="filter-label" for="rolldown-version">Rolldown:</label>
        <input
          id="rolldown-version"
          v-model="rolldownVersion"
          type="text"
          class="version-input"
          :placeholder="`e.g. ${data.latestVersions.rolldown}`"
          @keydown.escape="rolldownVersion = ''"
        />
        <button
          class="latest-btn"
          :class="{ active: rolldownVersion === data.latestVersions.rolldown }"
          @click="rolldownVersion = rolldownVersion === data.latestVersions.rolldown ? '' : data.latestVersions.rolldown"
        >
          Latest
        </button>
      </div>
    </div>

    <div class="plugin-stats">
      <span v-if="stats.filtered > 0">
        Showing {{ stats.start }}-{{ stats.end }} of {{ stats.filtered }} plugins
      </span>
      <span v-else>No plugins found</span>
      <span v-if="activeFilters.length">({{ activeFilters.join(', ') }} compatible)</span>
    </div>

    <div v-if="paginatedPlugins.length > 0" class="plugin-grid">
      <PluginCard v-for="plugin in paginatedPlugins" :key="plugin.name" :plugin="plugin" />
    </div>

    <p v-else class="no-results">No plugins found.</p>

    <nav v-if="totalPages > 1" class="pagination" aria-label="Plugin list pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        Previous
      </button>

      <div class="pagination-pages">
        <template v-for="(page, index) in visiblePages" :key="index">
          <span v-if="page === 'ellipsis'" class="pagination-ellipsis">...</span>
          <button
            v-else
            class="pagination-page"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </nav>
  </div>
</template>

<style scoped>
.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1400px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.plugin-search-container {
  margin-bottom: 1rem;
}

.plugin-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.version-input {
  width: 80px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.25s;
}

.version-input:focus {
  border-color: var(--vp-c-brand-1);
}

.version-input::placeholder {
  color: var(--vp-c-text-3);
}

.latest-btn {
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s, color 0.25s;
  white-space: nowrap;
}

.latest-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.latest-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.plugin-search {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.25s;
}

.plugin-search:focus {
  border-color: var(--vp-c-brand-1);
}

.plugin-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .plugin-grid {
    grid-template-columns: 1fr;
  }

  .plugin-filter-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-group {
    width: 100%;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem 0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s, color 0.25s;
}

.pagination-page:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.pagination-page.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.pagination-ellipsis {
  padding: 0 0.5rem;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .pagination {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .pagination-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .pagination-page {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }
}
</style>

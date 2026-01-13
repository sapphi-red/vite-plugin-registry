<script setup lang="ts">
</script>

<template>
  <section class="wrapper border-t px-5 sm:px-10 py-14 sm:py-20">
    <div class="max-w-2xl mx-auto">
      <p class="text-white/70 text-pretty mb-8">
        This registry collects plugin data from npm daily and provides a searchable directory of plugins for Vite, Rolldown, and Rollup.
      </p>
      <p class="text-white/70 text-pretty mb-8">
        The data is refreshed every day automatically based on the data from npm and metadata provided by plugin authors.
      </p>
      <h3 class="text-white text-lg font-semibold mb-4">For Plugin Authors</h3>
      <p class="text-white/70 text-pretty mb-8">
        Plugin authors can provide enhanced metadata by adding a <code class="text-white/90 bg-white/10 px-1.5 py-0.5 rounded">vite-plugin-registry</code> field to their <code class="text-white/90 bg-white/10 px-1.5 py-0.5 rounded">package.json</code>. See the <a href="/guide/" class="text-white underline">Guide</a> for details.
      </p>
      <h3 class="text-white text-lg font-semibold mb-4">Credits</h3>
      <p class="text-white/70 text-pretty">
        This registry is partially inspired by <a href="https://www.flint.fyi/blog/what-flint-does-differently/#plugin-registry" class="text-white underline" target="_blank" rel="noopener noreferrer">Flint's blog post "What Flint Does Differently"</a>.
      </p>
    </div>
  </section>
</template>

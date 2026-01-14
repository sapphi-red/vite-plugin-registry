<script setup lang="ts"></script>

<template>
  <section class="wrapper border-t px-5 sm:px-10 py-14 sm:py-20">
    <div class="max-w-2xl mx-auto vp-doc">
      <p class="text-white">
        This registry collects plugin data from npm daily and provides a searchable directory of
        plugins for Vite, Rolldown, and Rollup.
      </p>
      <p class="text-white">
        The data is refreshed every day automatically based on the data from npm and metadata
        provided by plugin authors.
      </p>
      <h3 class="text-white">For Plugin Authors</h3>
      <p class="text-white">
        Plugin authors can provide enhanced metadata by adding a
        <code>vite-plugin-registry</code>
        field to their
        <code>package.json</code>. See the
        <a href="/guide/" class="underline">Guide</a> for details.
      </p>
      <h3 class="text-white">Credits</h3>
      <p class="text-white">
        This registry is partially inspired by
        <a
          href="https://www.flint.fyi/blog/what-flint-does-differently/#plugin-registry"
          target="_blank"
          rel="noopener noreferrer"
          >Flint's blog post "What Flint Does Differently"</a
        >.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import Hero from './Hero.vue'
import About from './About.vue'
import { useData } from 'vitepress'
import type { FooterConfig } from '@voidzero-dev/vitepress-theme'
import { computed } from 'vue'

const { theme } = useData()
const footerConfig = computed<FooterConfig>(() => {
  const footer = theme.value.footer || {}
  return footer as FooterConfig
})
</script>

<template>
  <Hero />
  <About />
  <section
    class="wrapper wrapper--ticks border-t py-5 px-5 md:px-24 flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-start md:items-center"
  >
    <p class="text-sm">{{ footerConfig.copyright }}</p>
  </section>
</template>

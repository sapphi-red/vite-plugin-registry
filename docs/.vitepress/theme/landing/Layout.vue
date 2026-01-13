<script setup>
import Hero from './Hero.vue'
import About from './About.vue'
import Footer from '@components/oss/Footer.vue'
</script>

<template>
  <Hero />
  <About />
  <Footer
    heading="Start building"
    button-text="Browse Plugins"
    button-link="/plugins/"
  />
</template>

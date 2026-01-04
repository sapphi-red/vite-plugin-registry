import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import 'virtual:group-icons.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(FloatingVue)
  },
} satisfies Theme

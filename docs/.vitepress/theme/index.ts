import type { Theme } from 'vitepress'
import ViteTheme from '@voidzero-dev/vitepress-theme/src/vite'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import 'virtual:group-icons.css'
import './styles.css'
import { h } from 'vue'

export default {
  extends: ViteTheme,
  Layout: () => {
    return h(ViteTheme.Layout, null, {
      'nav-bar-title-after': () => h('div', { class: 'nav-title-after' }, 'Plugin Registry'),
    })
  },
  enhanceApp({ app }) {
    app.use(FloatingVue)
  },
} satisfies Theme

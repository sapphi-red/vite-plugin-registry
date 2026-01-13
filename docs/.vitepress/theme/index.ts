import type { Theme } from 'vitepress'
import ViteTheme from "@voidzero-dev/vitepress-theme/src/vite";
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import 'virtual:group-icons.css'
import "./styles.css";

export default {
  extends: ViteTheme,
  enhanceApp({ app }) {
    app.use(FloatingVue)
  },
} satisfies Theme

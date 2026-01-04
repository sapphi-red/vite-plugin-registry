import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  title: 'Vite Plugin Registry',
  description: 'Discover plugins for Vite, Rollup, Rolldown',
  cleanUrls: true,

  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    nav: [
      { text: 'About', link: '/about' },
      { text: 'Plugins', link: '/plugins' },
      { text: 'Guide', link: '/guide/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'Plugin Discovery', link: '/guide/discovery' },
            { text: 'Compatibility Detection', link: '/guide/compatibility' },
            { text: 'Extended Metadata', link: '/guide/extended-metadata' },
            { text: 'Registry Patches', link: '/guide/patches' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/sapphi-red/vite-plugin-registry' }],
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [groupIconVitePlugin(), Icons({ compiler: 'vue3' })],
  },
})

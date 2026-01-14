import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import Icons from 'unplugin-icons/vite'
import { extendConfig } from '@voidzero-dev/vitepress-theme/config'

const config = defineConfig<unknown>({
  title: 'Vite Plugin Registry',
  description: 'Discover plugins for Vite, Rolldown, and Rollup',
  cleanUrls: true,

  head: [['link', { rel: 'icon', href: 'https://vite.dev/logo-without-border.svg' }]],

  themeConfig: {
    variant: 'vite',

    footer: {
      copyright: `© 2026 VoidZero Inc. and Vite contributors.`,
    },

    nav: [
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

    socialLinks: [{ icon: 'github', link: 'https://github.com/vitejs/vite-plugin-registry' }],
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

export default extendConfig(config)

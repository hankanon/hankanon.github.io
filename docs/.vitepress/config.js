import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "个人网站",
  description: "hankanon 的个人网站",
  lastUpdated: true, // 最后更新时间
  // 主题配置选项
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 顶部导航栏
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: '笔记', link: '/笔记/sass学习笔记' },
      { text: 'test', link: 'test' }
    ],
    // 侧边栏
    sidebar: [
      {
        text: '笔记',
        collapsed: false,
        items: [
          { text: 'sass学习笔记', link: '/sass学习笔记' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'aaaaaaa', link: '/api-examples' }
        ]
      },
      {
        text: '读书',
        items: [
          { text: 'sass学习笔记', link: '/sass学习笔记' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'aaaaaaa', link: '/api-examples' }
        ]
      },
      {
        text: '游戏',
        items: [
          { text: 'sass学习笔记', link: '/sass学习笔记' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'aaaaaaa', link: '/api-examples' }
        ]
      },
      {
        text: '动漫',
        items: [
          { text: 'sass学习笔记', link: '/sass学习笔记' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'aaaaaaa', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Evan You'
    },
  },
})

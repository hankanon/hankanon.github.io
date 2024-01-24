import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: "浓浓的小屋",
  description: "欢迎来到浓浓的小屋",
  lastUpdated: true, // 最后更新时间
  // 主题配置选项
  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    i18nRouting: false,
    logo: '/logo.png',
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

    // 页面标题的层级
    outline: {
      label: '本页目录',
      level: 'deep'
    },

    // 可以定义此选项以在导航栏中展示带有图标的社交帐户链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    lastUpdatedText: '上次更新',
    darkModeSwitchLabel: '外观',
    returnToTopLabel: '返回顶部',
    
    // 可用于自定义出现在上一页和下一页链接上方的文本
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    // 页脚
    footer: {
      message: '浓浓的小屋',
    },
  },
})

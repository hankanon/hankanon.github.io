export default {
  '/学习/': [
    {
      text: 'JavaScript',
      collapsed: false,
      items: [
        { text: '数据类型', link: '/学习/JavaScript/types' },
        // { text: '引用类型的拷贝', link: '/学习/JavaScript/clone' },
        // { text: '类型转换', link: '/学习/JavaScript/conversions' },
        // { text: '原型和原型链', link: '/学习/JavaScript/prototype' },
        // { text: '继承', link: '/学习/JavaScript/inherit' }
      ]
    },

    // {
    //   text: 'TypeScript',
    //   link: '/学习/typescript/base'
    // },
    {
      text: 'HTML / CSS',
      collapsed: false,
      items: [
        // { text: 'HTML 理论知识点', link: '/学习/html/' },
        { text: 'SCSS 知识点', link: '/学习/css/sass学习笔记' }
      ]
    },
    // {
    //   text: '浏览器与网络',
    //   collapsed: false,
    //   items: [
    //     { text: '浏览器相关知识点', link: '/学习/browser/' },
    //     { text: 'TCP', link: '/学习/network/tcp' },
    //     { text: 'HTTP', link: '/学习/network/http' }
    //   ]
    // },
    // {
    //   text: '概念知识点',
    //   collapsed: false,
    //   items: [
    //     { text: '模块化', link: '/学习/concept/module' },
    //     { text: '前端页面渲染方式', link: '/学习/concept/page-rendering' }
    //   ]
    // },
    // {
    //   text: '编程题',
    //   link: '/学习/coding/'
    // }
  ],
  '/学习/design/': [
    {
      text: '设计模式-创建型模式',
      collapsed: false,
      items: [
        { text: '单例模式', link: '/学习/design/单例模式' }
      ]
    },
    {
      text: '设计模式-结构型模式',
      collapsed: false,
      items: [
        { text: '单例模式', link: '/学习/design/单例模式' }
      ]
    },
    {
      text: '设计模式-行为型模式',
      collapsed: false,
      items: [
        { text: '单例模式', link: '/学习/design/单例模式' }
      ]
    }
  ],
  '/生活/': [
    {
      text: '日常生活',
      // collapsed: false,
      items: [
        { text: '宅', link: '/生活/index' },
      ]
    }
  ],
  '/analysis/': [
    {
      text: '工具库',
      // collapsed: false,
      items: [
        { text: 'only-allow', link: '/analysis/utils/only-allow' },
        { text: 'clsx', link: '/analysis/utils/clsx' }
      ]
    }
  ],
  '/workflow/': [
    {
      text: '常用工具/方法',
      collapsed: false,
      items: [
        { text: '工具库整理', link: '/workflow/utils/library' },
        { text: '常用正则整理', link: '/workflow/utils/regexp' },
        { text: '常用方法整理', link: '/workflow/utils/function' }
      ]
    },
    {
      text: 'CSS 相关',
      collapsed: false,
      items: [
        { text: 'CSS 语法', link: '/workflow/css/spec' },
        { text: 'CSS 奇淫技巧', link: '/workflow/css/tricks' },
        { text: 'Sass 常用技巧', link: '/workflow/sass/' }
      ]
    },
    {
      text: 'Vue 相关',
      link: '/workflow/vue/'
    },
    {
      text: 'Node 相关',
      // collapsed: false,
      items: [{ text: 'npm 常用命令', link: '/workflow/node/npm' }]
    },
    {
      text: '终端相关',
      collapsed: false,
      items: [
        { text: 'Zsh 配置', link: '/workflow/terminal/zsh' },
        { text: '命令行工具', link: '/workflow/terminal/toolkit' },
        { text: 'Shell 命令', link: '/workflow/terminal/shell' }
      ]
    },
    {
      text: 'Git 相关',
      collapsed: false,
      items: [
        { text: 'Git 相关技巧', link: '/workflow/git/' },
        { text: 'Git 命令清单', link: '/workflow/git/command' }
      ]
    }
  ],
  '/efficiency/': [
    {
      text: '软件推荐与配置',
      // collapsed: false,
      items: [
        { text: '多平台软件', link: '/efficiency/software/cross-platform' },
        { text: 'Mac 平台', link: '/efficiency/software/mac' },
        { text: 'Windows 平台', link: '/efficiency/software/windows' },
        { text: '浏览器设置与扩展', link: '/efficiency/software/browser' },
        { text: 'Visual Studio Code 配置', link: '/efficiency/software/vscode' },
        { text: 'WebStorm 配置', link: '/efficiency/software/webstorm' }
      ]
    },
    { text: '在线工具', link: '/efficiency/online-tools' },
    { text: '书签脚本', link: '/efficiency/bookmark-scripts' }
  ],
  '/pit/': [
    {
      text: '踩坑记录',
      // collapsed: false,
      items: [
        { text: 'npm 踩坑记录', link: '/pit/npm' },
        { text: 'PC 踩坑记录', link: '/pit/pc' },
        { text: 'H5 踩坑记录', link: '/pit/h5' }
      ]
    }
  ]
}

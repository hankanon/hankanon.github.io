export default {
  '/学习/JavaScript': [
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
  '/学习/css/': [
    {
      text: 'CSS',
      collapsed: false,
      items: [
        { text: 'SCSS 知识点', link: '/学习/css/sass学习笔记' }
      ]
    }
  ],
  '/学习/network/': [
    {
      text: '网络',
      collapsed: false,
      items: [
        { text: 'nginx 学习笔记', link: '/学习/network/nginx学习笔记' }
      ]
    }
  ],
  '/学习/vue/': [
    {
      text: 'Vue',
      collapsed: false,
      items: [
        { text: 'Vue3 响应式原理', link: '/学习/vue/Vue3响应式原理' },
        { text: 'Vue 服务端渲染笔记', link: '/学习/vue/Vue 服务端渲染笔记' }
      ]
    }
  ],
  '/note/': [
    {
      text: '笔记',
      link: '/note/index'
    },
    {
      text: '移动端适配',
      link: '/note/移动端适配'
    },
    {
      text: 'WPS WebOffice 对接总结',
      link: '/note/WebOffice对接总结封面'
    }],
  '/学习/design/': [
    {
      text: '设计模式',
      link: '/学习/design/index'
    },
    {
      text: '创建型模式',
      collapsed: false,
      items: [
        { text: '单例模式', link: '/学习/design/单例模式' },
        { text: '工厂模式', link: '/学习/design/工厂模式' },
        { text: '建造者模式', link: '/学习/design/建造者模式' },
        { text: '原型模式', link: '/学习/design/原型模式' },
      ]
    },
    {
      text: '结构型模式',
      collapsed: false,
      items: [
        { text: '适配器模式', link: '/学习/design/适配器模式' },
        { text: '桥接模式', link: '/学习/design/桥接模式' },
        { text: '装饰器模式', link: '/学习/design/装饰器模式' },
        { text: '外观模式', link: '/学习/design/外观模式' },
        { text: '享元模式', link: '/学习/design/享元模式' },
        { text: '代理模式', link: '/学习/design/代理模式' },
      ]
    },
    {
      text: '行为型模式',
      collapsed: false,
      items: [
        { text: '责任链模式', link: '/学习/design/责任链模式' },
        { text: '命令模式', link: '/学习/design/命令模式' },
        { text: '解释器模式', link: '/学习/design/解释器模式' },
        { text: '迭代器模式', link: '/学习/design/迭代器模式' },
        { text: '中介者模式', link: '/学习/design/中介者模式' },
        { text: '备忘录模式', link: '/学习/design/备忘录模式' },
        { text: '观察者模式', link: '/学习/design/观察者模式' },
        { text: '状态模式', link: '/学习/design/状态模式' },
        { text: '策略模式', link: '/学习/design/策略模式' },
        { text: '模板方法模式', link: '/学习/design/模板方法模式' },
        { text: '访问者模式', link: '/学习/design/访问者模式' },
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
  '/游戏/': [
    {
      text: '游戏',
      link: '/游戏/index'
    }
  ],
  '/读书/': [
    {
      text: '读书',
      link: '/读书/index'
    }
  ],
  '/其他/': [
    {
      text: '其他',
      link: '/其他/index'
    }
  ]
  /* 以下为预留板块（对应目录 / 文章尚未创建），启用时取消注释
  ,
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
  */
}

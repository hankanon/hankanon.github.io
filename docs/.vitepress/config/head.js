export default [
  ['meta', { name: 'keywords', content: '网站,个人博客,浓浓的小屋,hankanon,卡农,卡侬,游戏,3D,3D打印,拓竹,笔记' }],
  ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
  ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
  ['meta', { name: 'msapplication-TileImage', content: '/favicon.ico' }],
  ['link', { rel: 'apple-touch-icon', href: '/favicon.ico' }],
  ['link', { rel: 'mask-icon', href: '/favicon.ico', color: '#3eaf7c' }],
  ['link', { rel: 'manifest', href: '/manifest.webmanifest' }],
  // 本地测试
  // [
  //   'script',
  //   {},
  //   `var _hmt = _hmt || [];
  //   (function() {
  //     var hm = document.createElement("script");
  //     hm.src = "https://hm.baidu.com/hm.js?6c1a25d25ff3b3cf8020279f94e027ef";
  //     var s = document.getElementsByTagName("script")[0]; 
  //     s.parentNode.insertBefore(hm, s);
  //   })();
  //   `,
  // ],
  // 线上
  [
    'script',
    {},
    `var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?22e67cdd4b97413abf41a775f89e50f6";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
    `,
  ],
]

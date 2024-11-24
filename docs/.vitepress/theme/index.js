import { h } from 'vue'
import { useData } from 'vitepress'
import Theme from 'vitepress/theme'
import './styles/index.scss'
import Layout from "./Layout.vue";
export default Object.assign({}, Theme, {
  Layout: () => {
    const props = {}
    // 获取 frontmatter
    const { frontmatter } = useData()

    /* 添加自定义 class */
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }
    return h(Layout, props, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
    // return h(Theme.Layout, props)
  },
  enhanceApp: ({app, router, siteData}) => {
    // console.log(app)
    // console.log(siteData)
    router.onBeforeRouteChange = (to) => {
      console.log('路由将改变为: ', to);
      if (typeof _hmt !== 'undefined') {
        _hmt.push(['_trackPageview', to]);
      }
    };
  }
})

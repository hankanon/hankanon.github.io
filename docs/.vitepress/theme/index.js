import { h } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue' 
import './styles/index.scss'
export default {
  extends: DefaultTheme,
  Layout: () => {
    const props = {}
    const { frontmatter } = useData()
    /* 添加自定义 class */
    props.class = frontmatter.value.layoutClass || ''
    return h(Layout, props);
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
}

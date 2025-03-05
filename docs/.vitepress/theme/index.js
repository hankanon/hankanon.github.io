import { h } from 'vue'
import { useData,inBrowser } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue' 
import confetti from "./components/confetti.vue";
import busuanzi from "busuanzi.pure.js";
import VisitorPanel from "./components/VisitorPanel.vue";
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
    app.component('confetti', confetti)
    app.component('VisitorPanel', VisitorPanel)
    if (inBrowser) {
      router.onBeforeRouteChange = (to) => {
        console.log('路由将改变为: ', to);
        if (typeof _hmt !== 'undefined') {
          _hmt.push(['_trackPageview', to]);
        }
      };
      router.onAfterRouteChanged = () => {
        busuanzi.fetch();
      };
    }
    // console.log(app)
    // console.log(siteData)
  }
}

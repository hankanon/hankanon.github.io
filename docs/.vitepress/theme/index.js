import { h, onMounted, watch, nextTick } from 'vue'
import { useData,inBrowser,useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue' 
import confetti from "./components/confetti.vue";
import busuanzi from "busuanzi.pure.js";
import VisitorPanel from "./components/VisitorPanel.vue";
import './styles/index.scss'
import mediumZoom from 'medium-zoom';
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
        mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' });
      };
      router.onAfterRouteChanged = () => {
        busuanzi.fetch();
      };
    }
    // console.log(app)
    // console.log(siteData)
  },
  setup() {
    const route = useRoute();
    const initZoom = () => {
      mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' }); // 默认
      // mediumZoom(".main img", { background: "var(--vp-c-bg)" }); // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  }
}

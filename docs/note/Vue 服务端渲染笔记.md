本文主要介绍：

1、什么是服务端渲染、与客户端渲染的区别是什么？
2、为什么需要服务端渲染，服务端渲染的利弊
3、服务端渲染的原理及技术实现

## 一、客户端渲染（CSR）VS服务端渲染(SSR)


CSR是Client Side Render简称；页面上的内容是我们加载的js文件渲染出来的，js文件运行在浏览器上面，服务端只返回一个html模板。

SSR是Server Side Render简称；页面上的内容是通过服务端渲染生成的，浏览器直接显示服务端返回的html就可以了。

一图以蔽之
![](https://cdn.jsdelivr.net/gh/hankanon/picture@master/img/20210523180410.png) 

CSR和SSR最大的区别在于前者的展示的页面是由浏览器生成并渲染的，而后者是服务器端直接返回HTML让浏览器直接渲染。

## 二、为什么要使用服务端渲染

服务端渲染的好处：
1、更好的 SEO（Search Engine Optimazition，即搜索引擎优化），由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面。如果 SEO 对你的站点至关重要，而你的页面又是异步获取内容，则你可能需要服务器端渲染(SSR)解决此问题
2、更快的内容到达时间 
无需等待所有的 JavaScript 都完成下载并执行，才显示服务器渲染的标记，所以你的用户将会更快速地看到完整渲染的页面。可以拥有更好的用户体验。
 缺点：
会增加项目整体复杂度，学习成本高。

页面是由服务器生成，对服务器压力较大

#### 服务端渲染和客户端渲染对比

|  | 服务端渲染 | 客户端渲染 |
| --- | --- | --- |
| 利 | 1、首屏渲染快、客户端直接解析服务端返回的HTML即可，不需要等待JS下载完才能解析。 2、利于SEO，服务端返回的HTML中包含页面内容3、减少请求次数|1、前后端分离，前端专注UI，后端专注业务逻辑2、局部刷新，无需每次请求完整页面。3、节省服务器性能|
| 弊 | 1、前后端职责不清，代码杂糅在一起，项目难以维护。2、页面数据变动每次需要请求完整的页面浪费性能。3、服务器压力大 | 1、首屏加载慢，要等JS加载完毕后才能渲染页面。2、SEO不友好。3、页面加载请求次数多 |

对比下传统的服务端渲染与客户端渲染的优缺点，我们会发现一件很有意思的事，服务端渲染的优点就是客户端渲染的缺点，服务端渲染的缺点就是客户端渲染的优点，反之亦然。那为何不**将传统的纯服务端直出的首屏优势和SPA的站内体验优势结合起来，以取得最优解？这就引出了当前流行的服务端渲染（Server Side Rendering），或者称之为同构渲染**更为准确
#### 同构的定义
所谓同构，就是让一份代码，既可以在服务端中执行，也可以在客户端中执行，并且执行的效果都是一样的，都是完成这个html的组装，正确的显示页面。也就是说，一份代码，既可以客户端渲染，也可以服务端渲染。但他们的作用不同，服务端渲染完成页面结构，浏览器端渲染完成事件绑定。

## 三、技术实现

#### 1、项目构建配置
1、官方的Vue SSR 构建图
![](https://cdn.jsdelivr.net/gh/hankanon/picture@master/img/20210523190224.png)

同步构建代码的执行流程如下：
![](https://cdn.jsdelivr.net/gh/hankanon/picture@master/img/20210523221208.png)

#### 服务端渲染简单页面
1、简单的服务端页面渲染，代码如下：
```js
const  Koa = require('koa');
const path = require('path')
let app = new Koa();
const Router = require('koa-router')
let router = new Router()
const { renderToString } = require("@vue/server-renderer");

import { createApp, createSSRApp, ref, onMounted } from 'vue'

var App = {
    template: `
      <div class="container">
        <p @click="handle">{{name}}</p>
        <p>{{input}}</p>
      </div>`,

    setup() {
      const input = ref(12345);
      onMounted(()=>{
        // console.log('onMounted')
      })
      function handle() {
        console.log('click')
      }
      return {
        handle,
        input,
        name: 'Vue SSR'
      }
    }
  }

router.get('/', async (ctx) => {
    let html = await renderToString(createSSRApp(App))
   ctx.body =  `<!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Document</title>
   </head>
   <body>
       ${html}
   </body>
   </html>`
});
app.use(router.routes())

app.listen(9999, () => {
    console.log('9999')
})
```
2、同构渲染简单的DEMO

* 客户端代码
```HTML
<!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Document</title>
       <script src="https://unpkg.com/vue@next"></script>
   </head>
   <body>
       <div id="app">
       ${html}
       </div>
       <script>
            const { createApp, ref, onMounted } = Vue
            var App = {
                template: `
                <div class="container">
                    <p @click="handle">{{name}}</p>
                    <p>{{input}}</p>
                </div>`,
                setup() {
                  const input = ref(12345);
                  onMounted(()=>{
                    // console.log('onMounted')
                  })
                  function handle() {
                    console.log('click')
                  }
                  return {
                    handle,
                    input,
                    name: 'Vue SSR'
                  }
                }
              }
            createApp(App).mount("#app")
       </script>
   </body>
   </html>
```

对于服务器端和客户端来说Vue的代码都是相同的，唯一的不同点在于，客户端代码多了一个挂载的操作 `mount("#app")`

问题点：数据的同步，服务端渲染的数据和客户端渲染的数据怎么保证一致
采用ejs 将服务端数据绑定到window 对象上，浏览器再从window获取，从而保证数据的一致。

#### 关键代码实现
1、服务端和客户端入口文件代码
```JavaScript
import { createApp, createSSRApp } from 'vue'

import App from '../pages/index.vue'
import page from 'components/common/page.vue'

const create = props => {
  let app
  if(typeof window !== 'undefined') {
    app = createApp(App, {...props}).component('page', page)
    app.mount("#app")
  }else {
    app = createSSRApp(App, {...props}).component('page', page)
  }
  return app
}


if(typeof window !== 'undefined') {

  window.app = create(window.__props)
} else {
  exports.create = create
}
```
2、服务端render方法的实现
```JavaScript
module.exports = async(ctx, next) => {
    ctx.render = async(context = {}) => {
    let __html = "",
        options = {
            loadjs: true,
            loadcss: true
        },
        viewpath = 'index'

        try {
            const app = require(`../ssr/${context.__name}`).create(context.__props)
            __html = await render(app)
        } catch (error) {
            console.log(error)
        }
    

    Object.assign(options, context.options || {})

    Object.assign(context, helpers, {
        vars,
        options,
        __html,
        assets
    }, ctx)

    const tmpl = fs.readFileSync(path.join(viewFolder, `${viewpath}.ejs`), 'utf-8')
    ctx.body = ejs.compile(tmpl, opts)(context)

    }

    await next()
}
```
服务端路由处理
```JavaScript
router.get('/', async (ctx) => {
    // 模拟服务端数据
    let data = require('./mock/index')
    function getColor()
   {
      var colorArray =new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
      var color="#";
      for(var i=0;i<6;i++)
	  {
          color+=colorArray[Math.floor(Math.random()*16)];
      }
      return color;
    }
    let cardList = data.homeStore.cardList.map(item => {
        item.background = getColor()
        return item
    })
    console.log(data)
    await ctx.render({
        __title: '首页',
        __name: 'index',
        __props: {
            cardList
        }
    })
})

router.get('/detail', async(ctx) => {
    let data = require('./mock/detail')
    await ctx.render({
        __name: 'detail',
        __title: '详情页',
        __props: {
            weeklyDetail: data.detailStore.weeklyDetail,
            title: data.title,
            categoryList: data.categoryList,
            weeklyList: data.weeklyList,
        }
    })

})
```

效果图：
![](https://cdn.jsdelivr.net/gh/hankanon/picture@master/img/2021-06-06%2004-40-18.2021-06-06%2004_42_02.gif)

#### 参考资料

* [彻底理解服务端渲染 - SSR原理](https://github.com/yacan8/blog/issues/30)
* [Vue.js 服务器端渲染指南](https://ssr.vuejs.org/zh/)
* [从头开始，彻底理解服务端渲染原理](https://juejin.cn/post/6844903881390964744)
* [谈谈我对服务端渲染\(SSR\)的理解](https://juejin.cn/post/6890810591968477191)
* [Vue3服务端渲染不完全指北](http://www.im6767.xyz/article/25)

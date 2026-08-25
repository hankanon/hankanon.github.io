# Vite 前端构建工具的探索与实践

> 本文基于 Vite 4.x 的实践经验整理，并对照 Vite 5/6/7/8 的最新规范进行了修正与补充。文中的配置示例以**稳定版（Vite 4/5/6，Rollup 内核）**为准，凡与最新版本（Vite 8，Rolldown + Oxc 内核）存在差异处，均以「📌 版本演进」标注说明，方便在不同版本间迁移。

---

## 目录

1. [Vite 是什么：no-bundle 理念](#1-vite-是什么no-bundle-理念)
2. [配置文件基础](#2-配置文件基础)
3. [CSS 处理：预处理器与 PostCSS](#3-css-处理预处理器与-postcss)
4. [静态资源处理](#4-静态资源处理)
5. [生产环境构建配置](#5-生产环境构建配置)
6. [构建优化核心手段](#6-构建优化核心手段)
7. [浏览器兼容性适配](#7-浏览器兼容性适配)
8. [缓存策略与部署](#8-缓存策略与部署)
9. [总结](#9-总结)

---

## 1. Vite 是什么：no-bundle 理念

Vite 是一个面向现代浏览器的前端构建工具，由两部分组成：

- **开发服务器（Dev Server）**：基于浏览器原生 ES Modules（ESM）能力，利用 esbuild 做依赖预构建，实现模块的按需编译与即时加载。
- **生产构建器**：使用 Rollup（Vite 8 起为 Rolldown）进行打包，产出高度优化的静态资源。

### 一个 import 即一个请求

在 Vite 的开发阶段，源代码中的每一条 `import` 语句都对应一次独立的 HTTP 请求：

```js
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

上述两条语句对应两个不同的请求。Vite Dev Server 读取本地文件并返回浏览器可解析的 ESM 代码；浏览器解析到新的 `import` 时再发起新请求，如此递归直到资源全部加载完成。

> **no-bundle 的真正含义**：开发阶段利用浏览器原生 ESM 支持，按模块粒度按需加载，而不是像 Webpack 那样先整体打包再加载。这省去了开发期繁琐且耗时的打包过程，是 Vite 启动快、热更新快的核心原因。

生产构建则不同——Vite 会完整打包以保证线上性能（Tree Shaking、代码分割、压缩等）。因此 Vite 是「开发用 No Bundle，生产用 Bundle」的双阶段策略。

---

## 2. 配置文件基础

Vite 的配置文件默认名为 `vite.config.ts`（或 `.js`/`.mjs`），使用 `defineConfig` 以获得类型提示：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// defineConfig 提供 TS 类型推导，推荐始终使用
export default defineConfig({
  plugins: [vue()],
})
```

`plugins` 数组用于注册 Vite/Rollup 插件。Vue 项目必须配置官方的 `@vitejs/plugin-vue`，它负责 `.vue` 单文件组件的编译与 HMR（热更新）。

### 配置函数的两种形态

> **📌 版本演进**：判断环境时，原文常用 `process.env.NODE_ENV === 'production'`，这在 Vite 中**不够可靠**——Vite 通过 `mode` 区分环境，而非依赖 `NODE_ENV`。推荐改用配置函数签名：

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // command: 'serve'（开发）| 'build'（生产）
  // mode: 来自 --mode 参数，如 development / production
  const isProduction = command === 'build'
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // 基于 command / mode / env 返回配置
    base: isProduction ? env.VITE_CDN_URL || '/' : '/',
  }
})
```

`loadEnv` 可读取 `.env`、`.env.[mode]` 文件中的环境变量（仅 `VITE_` 前缀的变量会暴露给客户端代码）。

---

## 3. CSS 处理：预处理器与 PostCSS

### 3.1 CSS 预处理器（Sass/Scss、Less、Stylus）

Vite 对主流 CSS 预处理器**内置支持**，只需安装对应的编译器依赖即可直接使用，无需额外插件：

```bash
pnpm i sass -D   # 以 SCSS 为例；Less 装 less，Stylus 装 stylus
```

### 3.2 全局注入 SCSS 变量 / mixin

使用 `css.preprocessorOptions.scss.additionalData` 在每个 SCSS 文件头部自动注入变量文件，避免手工重复 `@import`：

```ts
import { defineConfig, normalizePath } from 'vite'
import path from 'node:path'

// normalizePath 统一各平台路径分隔符，避免 Windows 下路径报错
const variablePath = normalizePath(
  path.resolve('./src/assets/css/vars.scss'),
)

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 注意：注入的内容会出现在每个文件开头，因此不能包含会产生实际样式的规则，
        // 只能放变量、mixin、function 等不产生输出的声明
        additionalData: `@import "${variablePath}";`,
      },
    },
  },
})
```

> **注意**：`additionalData` 注入的文件中**不应包含普通 CSS 规则**（如 `.foo { color: red }`），否则每个 SCSS 文件都会重复输出这些样式，导致产物体积膨胀。它只适合放变量、mixin、函数等无副作用声明。

### 3.3 PostCSS 配置

PostCSS 用于自动补齐浏览器前缀（autoprefixer）、使用未来 CSS 语法（postcss-preset-env）等。推荐将配置抽到独立的 `postcss.config.js`，或内联在 `css.postcss` 中（**必须是返回对象的函数形式**，不要用裸对象）：

```ts
import autoprefixer from 'autoprefixer'
import postcssPresetEnv from 'postcss-preset-env'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssPresetEnv({
          autoprefixer: {
            overrideBrowserslist: ['> 1%', 'last 2 versions'],
          },
        }),
      ],
    },
  },
})
```

> **📌 版本演进**：原文示例中 `overrideBrowserslist: ['Chrome > 40', 'ff > 31', 'ie 11']` 已不合时宜——IE 11 已于 2022 年停止支持，现代项目无需再为其做前缀/语法降级。若确有旧浏览器需求，请使用 `@vitejs/plugin-legacy`（见第 7 节）。
>
> **📌 版本演进（Vite 8）**：Vite 8 默认集成 **Lightning CSS** 处理样式，可在 `css.transformer: 'lightningcss'` 启用，其兼具预处理器与 autoprefixer 能力，性能显著优于 PostCSS。迁移到 Vite 8 时可考虑用 Lightning CSS 替代 PostCSS 链路。

---

## 4. 静态资源处理

### 4.1 路径别名（alias）

用 `@` 指向 `src` 可避免深层相对路径（`../../`）：

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
})
```

> **📌 版本演进**：原文使用 `path.join(__dirname, 'src/assets')`，但 Vite 配置为 ESM（`"type": "module"`）时 `__dirname` 不可用。推荐使用 `fileURLToPath(new URL(...))` 或 `import.meta.dirname`（Node 20.11+）替代。

### 4.2 SVG 作为组件加载

使用 `vite-svg-loader` 可将 SVG 直接作为 Vue 组件引入，便于通过 `props` 控制颜色、尺寸：

```ts
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [vue(), svgLoader()],
})
```

```vue
<script setup>
import IconHome from '@assets/icons/home.svg?component'
</script>

<template>
  <IconHome class="icon" />
</template>
```

### 4.3 JSON 加载

Vite 原生支持 JSON 导入，并支持具名导入与 Tree Shaking：

```ts
export default defineConfig({
  json: {
    // 设为 true 时整个 JSON 被序列化为默认导出（名为导入会被禁用）
    // 默认 false：支持具名导入，未使用的字段会被 Tree Shaking 掉
    stringify: false,
    // namedDeclaration: true  // Vite 6+ 可为具名导入生成类型声明
  },
})
```

### 4.4 其它静态资源类型

媒体（mp4/webm/ogg/mp3…）、字体（woff/woff2/ttf…）、文本（pdf/txt…）等 Vite 默认按资源处理。如需识别额外扩展名（如 `.gltf`），用 `assetsInclude`：

```ts
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

---

## 5. 生产环境构建配置

### 5.1 基础路径 base

`base` 决定资源在线上的公共路径，部署到 CDN 子路径或非根域名时必须配置：

```ts
export default defineConfig(({ command }) => ({
  // 生产环境指向 CDN；开发环境用 '/'
  base: command === 'build'
    ? 'https://cdn.example.com/assets/'
    : '/',
}))
```

代码中引用资源请使用 `import.meta.env.BASE_URL`，它会随 `base` 自动替换。

### 5.2 资源内联阈值 assetsInlineLimit

小于阈值的静态资源会被内联为 base64，省去一次请求；大于阈值的提取为独立文件，利于缓存与并行加载。

```ts
export default defineConfig({
  build: {
    // 默认 4096（4 KiB）。设为 0 可完全禁用内联
    // 也可传函数做精细化控制：(filePath, content) => boolean
    assetsInlineLimit: 4096,
  },
})
```

> **说明**：默认 4KB 是经验值——过小则内联收益低，过大则 base64 体积膨胀且失去并行加载优势。多数场景保持默认即可，小图标内联、大图外链是合理策略。

### 5.3 构建目标 build.target

控制语法降级程度，直接影响产物体积与兼容性：

```ts
export default defineConfig({
  build: {
    // 'modules'（Vite 4/5/6 默认）= 支持原生 ESM 的现代浏览器
    // Vite 7+ 默认改为 'baseline-widely-available'（Chrome111/FF114/Safari16.4 等）
    // 'esnext'：几乎不降级，体积最小但兼容性最差
    target: 'modules',
  },
})
```

> **📌 版本演进**：Vite 7 起 `build.target` 默认值由 `'modules'` 调整为 `'baseline-widely-available'`，对齐 Baseline 标准。如项目需兼容更老浏览器，见第 7 节。

### 5.4 压缩 minify

```ts
export default defineConfig({
  build: {
    // Vite 4/5/6 默认 'esbuild'（快，压缩率略低）
    // Vite 8 默认 'oxc'（Rust 实现，比 terser 快数十倍）
    minify: 'esbuild',
    // 使用 terser 可获得更高压缩率，但需安装 terser 且更慢：
    // minify: 'terser',
    // terserOptions: { compress: { drop_console: true } },
  },
})
```

> **📌 重要变更**：`build.minify: 'esbuild'` 在新版 Vite 中**已被标记为弃用**，未来将移除；Vite 8 默认改用基于 Rust 的 Oxc Minifier（`'oxc'`）。如需极高压缩率可回退 `'terser'`（需 `npm i -D terser`），但会显著拖慢构建。

### 5.5 CSS 代码分割 cssCodeSplit

```ts
export default defineConfig({
  build: {
    // 默认 true：异步 chunk 的 CSS 会随该 chunk 一起按需加载
    // 设为 false：所有 CSS 提取到单一文件（首屏即全量加载）
    cssCodeSplit: true,
  },
})
```

---

## 6. 构建优化核心手段

### 6.1 代码分割（Code Splitting）

代码分割是首屏优化最关键的手段：把不随首屏渲染的第三方库、路由组件拆成独立 chunk，实现按需加载与并行下载。

**方式一：基于路由的动态导入（推荐，零配置）**

使用 `import()` 动态导入路由组件，Vite/Rollup 会自动将其拆为独立 chunk：

```ts
// router.ts —— 路由级懒加载
const routes = [
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/about', component: () => import('@/views/About.vue') },
]
```

**方式二：manualChunks 手动分包**

对 `node_modules` 中的第三方依赖做精细化拆分，使其能长期缓存、不被业务改动 invalidate：

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 函数式：按模块来源决定分包
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 体积大、变更少的库单独成包
            if (id.includes('echarts') || id.includes('monaco-editor')) {
              return 'heavy-vendor'
            }
            return 'vendor' // 其余第三方库归入 vendor
          }
        },
        // 或用对象式精确指定（注意：对象式与函数式二选一）
        // manualChunks: {
        //   'vue-vendor': ['vue', 'vue-router', 'pinia'],
        // },
      },
    },
  },
})
```

> **📌 修正**：原文使用的 `vite-plugin-chunk-split` 并非官方方案，且原文示例在 Vue 项目里错误地写成了 `['react', 'vue-router']`，语义混乱。官方推荐直接用 Rollup 内置的 `manualChunks`，无需额外插件。
>
> **📌 版本演进（Vite 8）**：`build.rollupOptions` 已成为 `build.rolldownOptions` 的别名，分包配置迁移到 `build.rolldownOptions.output.manualChunks`（Rolldown 语法与 Rollup 基本兼容）。

### 6.2 Tree Shaking

Vite 生产构建基于 Rollup/Rolldown，**默认开启** Tree Shaking（依赖 ESM 的静态分析）。要使其生效需注意：

1. **始终使用 ESM 语法导出/导入**（`export` / `import`），避免 CommonJS。
2. **副作用声明**：在 `package.json` 中声明 `sideEffects` 字段，告诉打包器哪些文件有副作用不可删除：
   ```json
   { "sideEffects": ["*.css", "./src/polyfills.ts"] }
   ```
3. **库模式外部化依赖**：开发库时用 `build.lib` + `rollupOptions.external` 排除不应打进产物的依赖（见第 5 节延伸）。
4. 避免 `import * as _ from 'lodash'` 整包引入，使用 `import debounce from 'lodash/debounce'` 或 `lodash-es`。

### 6.3 资源压缩与优化

**图片压缩（修正）**：原文推荐的 `vite-plugin-imagemin` 已**停止维护**，且其原生依赖（binaries）在多数环境下安装困难。推荐替代方案：

- **构建前处理**：用 `sharp`、`svgo`（CLI）在 CI 流程中预处理图片；
- **构建期替代插件**：`vite-plugin-image-optimizer`（基于 sharp/svgo，维护活跃）；
- **现代格式**：优先输出 AVIF/WebP，体积比 PNG/JPG 小 30%~70%；

```ts
// 示例：使用 vite-plugin-image-optimizer（需安装 sharp / svgo）
import { viteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    viteImageOptimizer({
      png: { quality: 80 },
      webp: { quality: 75 },
      svgo: { plugins: [{ name: 'preset-default' }] },
    }),
  ],
})
```

**JS/CSS 压缩**：见 5.4 节 `minify`（默认 esbuild/oxc，已是较优解）。

### 6.4 构建产物分析

定位体积瓶颈，针对性优化：

```bash
pnpm add -D rollup-plugin-visualizer
```

```ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({ filename: 'dist/stats.html', open: true }),
  ],
})
```

构建后打开 `dist/stats.html` 可直观看到每个 chunk 的体积占比。

### 6.5 减少报警阈值与产物校验

```ts
export default defineConfig({
  build: {
    // 超过该体积（未压缩 kB）会输出警告，提示你做代码分割
    chunkSizeWarningLimit: 500,
  },
})
```

---

## 7. 浏览器兼容性适配

Vite **默认只做语法转换，不注入 polyfill**。现代浏览器无需处理；若需兼容旧浏览器，分两种场景：

### 7.1 语法降级 + Polyfill：@vitejs/plugin-legacy

为旧浏览器生成 legacy chunk 并自动注入 `SystemJS` polyfill 与 `core-js`：

```ts
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      // 现代浏览器无需 polyfill，legacy 包才包含
      modernPolyfills: true,
    }),
  ],
})
```

> **📌 修正**：原文给出的 `@babel/preset-env` + `useBuiltIns: 'usage'` 是 Babel 体系做法。在 Vite 中**不应手写 Babel 配置**，应使用官方 `plugin-legacy` 统一处理语法降级与 polyfill 注入。

### 7.2 CSS 兼容性目标

CSS 前缀与语法降级由第 3.3 节的 autoprefixer / postcss-preset-env 的 `browserslist` 控制，无需单独工具。现代项目建议：

```text
# .browserslistrc
> 0.5%
last 2 versions
not dead
```

> **📌 修正**：原文中 `IE >= 11` 的目标已无意义（IE 已 EOL）。除非业务强依赖，否则不必再为 IE 做兼容。

---

## 8. 缓存策略与部署

### 8.1 内容哈希与长效缓存

Vite 构建产物默认带内容哈希（如 `index-a1b2c3.js`），内容不变则文件名不变。配合 CDN/服务器的长效缓存策略可实现「一次下载，长期复用」：

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 自定义哈希格式（默认已合理，通常无需改）
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
```

### 8.2 HTML 不缓存、静态资源长缓存

- `index.html`：设 `Cache-Control: no-cache`，避免用户拿到旧 HTML 引用旧资源；
- JS/CSS/图片：设 `Cache-Control: max-age=31536000, immutable`，因带哈希可安全长缓存。

Vite 在动态导入失败时派发 `vite:preloadError` 事件，可借此做「刷新以获取新版本」处理：

```ts
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})
```

---

## 9. 总结

前端构建工具并非只有 Webpack 一种答案。Vite 用「开发 No Bundle + 生产 Rollup/Rolldown 打包」的双引擎策略，在开发体验与产物质量之间取得了很好的平衡：

- **开发期**：原生 ESM 按需加载，启动与热更新极快；
- **生产期**：Rollup（Vite 8 为 Rolldown）提供 Tree Shaking、代码分割、压缩等成熟优化；
- **开箱即用**：内置最佳实践（别名、CSS 预处理、资源处理、哈希缓存），学习成本低。

### 本文修正与补充要点回顾

| 原文内容 | 问题 | 本文修正 |
|----------|------|----------|
| `vite-plugin-imagemin` | 已停止维护、安装困难 | 改用 `vite-plugin-image-optimizer` / sharp / svgo |
| `vite-plugin-chunk-split` + `['react','vue-router']` | 非官方、Vue 项目误用 react | 改用官方 `manualChunks` |
| `@babel/preset-env` 手写配置 | 与 Vite 体系冲突 | 改用 `@vitejs/plugin-legacy` |
| `build.minify: 'esbuild'` | 新版已弃用 | 说明弃用，Vite 8 默认 `oxc` |
| `IE 11` 兼容目标 | IE 已 EOL | 现代 browserslist 目标 |
| 缺少优化手段 | 漏项 | 补充 Tree Shaking、manualChunks、产物分析、缓存策略 |

Vite 适合写 Demo 或在新项目（尤其用户范围可控的中小型项目）中直接落地。对于大型存量项目，建议渐进式引入（如先用 Vite 做开发服务器，再逐步过渡构建流程），避免一次性重构带来未知风险。随着 Vite 8 统一到 Rolldown + Oxc 内核，构建性能与产物一致性还将进一步提升，值得持续关注。

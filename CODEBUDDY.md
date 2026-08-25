# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 项目概览

这是一个基于 VitePress 的个人博客 / 前端知识库（站名「浓浓的小屋」），内容全部为中文，按主题分类存放 Markdown 笔记，部署到 GitHub Pages（远程仓库 `github.com:hankanon/hankanon.github.io`）。包管理器为 pnpm，根目录的 `package.json` 仅有 VitePress 及其少量依赖，无测试 / Lint / 单元测试体系，所有"开发"工作集中在 `docs/` 目录内。

## 常用命令

- **安装依赖**：`pnpm install`。项目使用 pnpm，勿引入 `package-lock.json` 或 `yarn.lock`（已在 .gitignore 中忽略）。
- **本地开发**：`pnpm docs:dev`，启动 VitePress 开发服务器（默认 http://localhost:5173），支持热更新，改动 Markdown / Vue / SCSS 后即时生效。
- **构建**：`pnpm docs:build`，产物输出到 `docs/.vitepress/dist`（该目录被 git 忽略，勿提交）。
- **预览构建产物**：`pnpm docs:preview`，本地静态预览 `docs:build` 的结果。
- 无 `lint` / `test` 脚本；修改配置或主题后通过 `docs:dev` 自行验证即可。
- **依赖说明**：运行时依赖各有固定消费点 —— `canvas-confetti` 供全局组件 `confetti` 使用；`medium-zoom` 由 `theme/index.js` 与 `Layout.vue` 两处初始化（改动须同步）；`busuanzi.pure.js` 做访问统计（在 `theme/index.js` 路由切换后刷新）；`@giscus/vue` 提供 `Layout.vue` 中的 Giscus 评论。新增依赖时确认落在这些消费点之一。

## 架构

### 配置层：`docs/.vitepress/config.js`

VitePress 配置的唯一边缘入口，本身只组装三个子模块（均使用 ESM，注意 `package.json` 声明了 `"type": "module"`）：

- `config/nav.js` — 顶部导航栏。大量条目以注释形式保留，代表"计划中 / 未启用的板块"。
- `config/sidebar.js` — 侧边栏。**新增或移动文章时，必须同步维护对应路由前缀下的分组**。注意其中 `/analysis/`、`/workflow/`、`/efficiency/`、`/pit/` 等前缀的配置项指向的目录在仓库中尚不存在，属于预留配置，不要误以为它们是已发布的页面。
- `config/head.js` — `<head>` 注入：meta 标签、manifest、以及**百度统计（`_hmt`）脚本**。其中"本地测试"与"线上"两组统计代码被注释 / 启用的切换方式，修改时注意保留线上代码。

### 主题层：`docs/.vitepress/theme/`

`index.js` 是自定义主题入口：`extends: DefaultTheme`，通过 `Layout: () => h(Layout, props)` 包装自定义 `Layout.vue` 并透传 `layoutClass` frontmatter 作为页面根 class；`enhanceApp` 中注册了全局组件 `confetti` 与 `VisitorPanel`，并利用 `router.onBeforeRouteChange` 向百度统计上报路由变化（与 `config/head.js` 的 `_hmt` 埋点成对工作），`onAfterRouteChanged` 时刷新 busuanzi 访问统计；`setup()` 内对带 `data-zoomable` 属性的图片初始化 medium-zoom 图片缩放（初始化在 `index.js` 和 `Layout.vue` 两处都有，改动时保持同步）。

`Layout.vue` 通过 VitePress 默认主题的插槽注入能力定制页面：`#doc-footer-before` 槽注入 `BackTop` 返回顶部组件，`#doc-after` 槽注入 Giscus 评论（绑定 GitHub Discussions，仓库 `hankanon/hankanon.github.io`，按 `page.filePath` 区分每篇文章的讨论）。它还用 `watch(isDark)` + 向 giscus iframe `postMessage` 的方式同步评论主题与站点的明暗切换。

`styles/` 下按职责拆分：`vars.scss`（设计变量）、`rainbow.scss`、`overrides.scss`（覆盖默认主题样式）、`index.scss`（汇总入口，含 medium-zoom 层级修正）。SCSS 使用 `modern-compiler` API（在 `config.js` 的 `css.preprocessorOptions.scss` 中配置）。

### 内容层：`docs/` 下的中文目录即 URL 路径

- 首页 `docs/index.md` 使用 `layout: home`（frontmatter 中 `layoutClass: 'home-layout'`），页面内直接内联 `<confetti></confetti>`、`<VisitorPanel></VisitorPanel>` 两个全局注册组件，样式通过 `<style src="./index.scss">` 引入。首页 hero 的 `link` 指向 `/学习/index` 等中文路径。
- 分类目录：`读书/`、`学习/`（含 `design/` 设计模式系列、`JavaScript/`、`css/`、`network/`、`vue/`）、`note/`、`生活/`、`游戏/`、`其他/`、`tool/`。绝大多数笔记是纯 Markdown 正文（如 `学习/design/*.md`），不带 frontmatter；仅首页、tool 页和个别页面使用 frontmatter / 内联组件。新增笔记遵循"目录即分类、侧边栏分组手动登记"的惯例。
- **`tool/` 是特殊导航页**：`index.md` 通过 `<script setup>` 导入 `./data.js`（前端导航书签数据，结构为 `{ title, items: [{ icon, title, desc, link }] }`）与 `./components/MNavLinks.vue` / `MNavLink.vue` 渲染响应式书签网格，是"Markdown + Vue 组件 + 数据文件"混合用法的示例。新增书签直接编辑 `data.js` 即可。
- `public/` 存放静态资源：`favicon.ico`、`avatar.png`（首页 hero 头像）、`logo.png`、`manifest.webmanifest`，以 `/` 绝对路径引用。

### 部署

无 CI 配置文件，站点依赖 GitHub Pages 服务构建；本地用 `pnpm docs:build` 产出 `docs/.vitepress/dist` 验证构建结果后推送到 `origin`（`hankanon/hankanon.github.io`）发布。`docs/.vitepress/cache/` 与 `docs/.vitepress/dist/` 均为本地产物，不属于源码。

- **部署基路径**：`config.js` 中 `base: '/'` 且仓库名为 `hankanon.github.io`（即 GitHub Pages 的 user/organization 根域），因此无需子路径 base。若未来改仓到非 `*.github.io` 根域或 Project Pages，需相应调整 `base`。
- **站内搜索**：`themeConfig.search.provider: "local"`（VitePress 内置本地搜索，由 `@localSearchIndex` 自动构建），无 Algolia / 外部搜索配置，新增内容无需登记即可被搜到。
- **待修项提示**：`config.js` 的 `socialLinks` 中 github 链接目前指向 `vuejs/vitepress` 占位地址，非本站仓库，发布前建议改为 `hankanon/hankanon.github.io`。

### 修改指南要点

- 新增文章：在对应中文分类目录下创建 `.md`，并在 `config/sidebar.js` 对应前缀分组中登记链接（`link` 不含 `.md` 后缀，中文文件名直接写中文路径，如 `'/学习/design/单例模式'`）。
- 新增导航书签：编辑 `docs/tool/data.js`。
- 修改评论 / 统计 / 主题行为：`Layout.vue`（giscus）、`theme/index.js`（busuanzi、medium-zoom、百度统计上报）、`config/head.js`（统计脚本本身）。
- 明暗主题相关样式改动，注意同时覆盖 VitePress 的 `--vp-*` CSS 变量（见 `styles/vars.scss`）以兼顾两套主题。

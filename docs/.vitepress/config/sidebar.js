import autoSidebar from './autoSidebar'

/**
 * 侧边栏由 autoSidebar 在构建期自动扫描 docs/ 下所有 .md 生成：
 *  - 新增 / 移动文章后无需手动登记，目录自动出现且可点击跳转（link 即路由）。
 *  - 顶层按一级中文目录分组（读书 / 学习 / 生活 …），子目录递归为可折叠分组。
 *  - 每篇文章显示名优先取正文首个「# 标题」，否则用文件名；index.md 作为分组首页置顶。
 *
 * 如需对个别板块（如尚未创建目录的预留板块）手动追加条目，
 * 可在此处解构 autoSidebar 后合并，例如：
 *   const manual = { '/analysis/': [ { text: '工具库', items: [...] } ] }
 *   export default { ...autoSidebar, ...manual }
 */
export default autoSidebar

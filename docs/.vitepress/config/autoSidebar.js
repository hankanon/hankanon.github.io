import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// docs 根目录：config/autoSidebar.js -> docs/.vitepress/config -> docs
const DOCS_ROOT = path.resolve(__dirname, '../../')

/**
 * 读取文章首个一级标题（# 标题）作为目录显示名；取不到则用文件名。
 */
function getTitleFromMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/^\s*#\s+(.+?)\s*$/m)
    if (match) {
      // 去掉标题中的链接语法 [text](url) -> text
      return match[1].replace(/\[(.+?)\]\(.+?\)/g, '$1').trim()
    }
  } catch (e) {
    // 读取失败时回退到文件名
  }
  return path.basename(filePath, '.md')
}

/**
 * 将绝对文件路径转为 VitePress 路由 link（相对 docs 根，去扩展名，统一用 / 分隔）。
 */
function toLink(absFile) {
  const rel = path.relative(DOCS_ROOT, absFile).replace(/\\/g, '/')
  return '/' + rel.replace(/\.md$/, '')
}

// 需要忽略的目录 / 文件（非文章内容）
const IGNORE_DIRS = new Set(['.vitepress', 'public', 'node_modules', '.git'])
const INDEX_FILE = 'index.md'

/**
 * 递归扫描目录，生成 VitePress 侧边栏分组结构。
 * @param {string} absDir  当前扫描的绝对目录
 * @param {string} routePrefix 该目录对应的路由前缀（以 / 开头，含末尾 /）
 * @returns {Array} 侧边栏 items 数组
 */
function scanDir(absDir, routePrefix) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true })
  const items = []

  // 1) 先处理 index.md（作为本组的「首页」入口，置于分组顶部）
  const indexEntry = entries.find((e) => e.isFile() && e.name === INDEX_FILE)
  if (indexEntry) {
    const abs = path.join(absDir, INDEX_FILE)
    items.push({
      text: getTitleFromMarkdown(abs),
      link: routePrefix + 'index',
    })
  }

  // 2) 子目录 -> 递归成可折叠分组
  const dirs = entries
    .filter((e) => e.isDirectory() && !IGNORE_DIRS.has(e.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  for (const dir of dirs) {
    const childAbs = path.join(absDir, dir.name)
    const childPrefix = routePrefix + dir.name + '/'
    const childItems = scanDir(childAbs, childPrefix)
    // 子目录若内部有文章，则作为可折叠分组；否则跳过空目录
    const articleItems = childItems.filter((it) => it.link)
    if (articleItems.length) {
      items.push({
        text: dir.name,
        collapsed: false,
        items: articleItems,
      })
    }
  }

  // 3) 当前目录下的普通 .md 文章（排除 index.md）
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== INDEX_FILE)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  for (const file of files) {
    const abs = path.join(absDir, file.name)
    items.push({
      text: getTitleFromMarkdown(abs),
      link: toLink(abs),
    })
  }

  return items
}

/**
 * 生成完整侧边栏：以 docs 下的一级分类目录为顶层 key。
 * 返回形如 { '/学习/': [...], '/读书/': [...], ... }
 */
export function buildSidebar() {
  const topEntries = fs.readdirSync(DOCS_ROOT, { withFileTypes: true })
  const sidebar = {}

  const topDirs = topEntries
    .filter((e) => e.isDirectory() && !IGNORE_DIRS.has(e.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  for (const dir of topDirs) {
    const prefix = '/' + dir.name + '/'
    const items = scanDir(path.join(DOCS_ROOT, dir.name), prefix)
    if (items.length) {
      // 顶层分组用目录名作标题，内部文章作为可折叠 items
      sidebar[prefix] = [
        {
          text: dir.name,
          collapsed: false,
          items,
        },
      ]
    }
  }

  return sidebar
}

export default buildSidebar()

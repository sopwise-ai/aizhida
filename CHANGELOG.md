# 更新日志

本项目的所有显著变更都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- 初始 Next.js 16 应用：App Router、TypeScript、Tailwind CSS 4、shadcn/ui
  （`components.json`，radix-nova 风格）。
- AI 工具导航核心功能：搜索（同义词扩展）、多维筛选（分类/定价/开源）、
  ⌘K 命令面板、工具提交表单。
- 构建期数据校验：`data/tools.json` 经 zod 校验，非法数据让 `next build`
  直接失败。
- 环境变量校验：`lib/env.ts`（zod + t3-env）；生产构建缺少
  `NEXT_PUBLIC_SITE_URL` 或指向 localhost 时失败。
- 全站安全响应头：CSP、HSTS、`X-Frame-Options`、`Permissions-Policy`。
- 质量工具链：Biome（lint）、Prettier（含 Tailwind 类排序）、tsc、Knip。
- 测试：Vitest + Testing Library 单测（覆盖率阈值 70/70/70/60）、
  Playwright 端到端（Chromium 桌面 + Pixel 7 移动、axe 无障碍扫描、
  安全响应头断言）。
- Git 钩子：Husky + lint-staged + commitlint（Conventional Commits）。
- CI：format → lint → typecheck → knip → 单测 → 构建 → URL 必填反向校验
  → e2e → PR 标题检查。
- App Router 边界：`error.tsx`、`global-error.tsx`、`loading.tsx`、
  `not-found.tsx`；`sitemap.ts`、`robots.ts`、`manifest.ts`。
- 服务端错误结构化日志：`instrumentation.ts`（`onRequestError`）。
- 基础配置：`.editorconfig`、`.gitattributes`、`.npmrc`（engine-strict）、
  `.nvmrc`、`.vscode/` 工作区设置。
- 工程文档：README、ARCHITECTURE、CONTRIBUTING、SECURITY、CHANGELOG、
  MIT LICENSE。

### Added

- 工具详情页 `/tools/[id]`：85 个页面构建期预渲染，包含完整描述、能力标签、
  官方入口、基本信息、同类工具内链、canonical、Open Graph 与
  JSON-LD（SoftwareApplication + BreadcrumbList）；未知 id 直接 404。
- 客户端摘要投影 `ToolSummary`（`lib/summary.ts`）：首页不再把
  `description`、`links`、运营字段下发到浏览器，首页 HTML 从 390KB 降到 278KB。
- 首页增量渲染：首屏 48 张卡片，底部按批追加；筛选变化自动回到第一批，
  DOM 上限不再随工具数量线性增长。
- 卡片增加「详情」入口（整卡仍直达官网），详情页之间通过同类工具互相内链。
- 分类落地页 `/c/[category]`：11 个 SSG 页面，含分类导语、跨分类内链、
  CollectionPage / ItemList JSON-LD，footer 与详情页面包屑均指向分类页。
- 首页改为无限滚动：`IntersectionObserver`（`rootMargin: 600px`）在接近底部时
  自动追加下一批 48 个工具；不支持 IO 的环境退化为「再显示」按钮。
- sitemap 覆盖全部详情页与分类页（99 条 URL）。
- logo 资产改为 `public/logos/{id}.{ext}`（不再绑定域名），扩展名索引只留在服务端；
  `ToolSummary` 直接携带 `logo` 路径，客户端不再加载 65 条映射表。

### Changed

- 工具数据模型升级到 v2（85 条记录全部迁移）：
  - `platform` 单值改为 `platforms` 多值，并新增 `type`（应用/模型/编辑器/
    插件/平台/框架/API 服务/运行时）区分「产品形态」与「交付渠道」。
  - 分类从 6 个扩展到 11 个（新增对话助手、语音、搜索、设计、基础设施）。
  - 自由标签拆为受控 `features`（59 项词表，2–6 个）与自由 `keywords`；
    卡片、搜索与筛选统一使用词表 label。
  - `desc` 拆为卡片用 `tagline`（≤60）与详情页/SEO 用 `description`
    （120–300 字），85 条全部补齐。
  - 新增 `vendorId` + `data/vendors.json` 厂商注册表，构建期做外键校验。
  - 新增 `status`、`addedAt`、`updatedAt`、`verifiedAt` 生命周期字段。
  - `url` 扩为 `links{website,github,docs,pricing,store}`，并预留
    `affiliateUrl` / `sponsored`。
  - 新增跨记录校验：id 唯一、官网唯一、日期先后关系、数组去重。
- 分类条改为单行横向滚动，避免 11 个分类把粘性工具栏折成多行。
- 提交表单同步 v2：分类最多 3 个、平台与特性多选、新增厂商/形态字段，
  生成的 JSON 预览直接对应新结构。

### Fixed

- `packageManager` 与 `repository` 字段补齐，CI 的 pnpm 版本改由该字段提供。
- e2e 断言与真实 DOM 对齐（搜索结果标题、sitemap 内容、移动菜单标签）。
- 移除 `.gitignore` 重复的 `*.tsbuildinfo`；统一日志忽略模式。
- lint-staged 与 biome 的双格式化冲突：格式化统一由 prettier 决定，
  biome 以只读 `--staged` 模式前置。
- `noUncheckedIndexedAccess` 启用后修复 `tools-explorer.tsx` 的键盘导航
  索引访问。
- 依赖重装后 `pnpm run dev` 启动即报 `Can't resolve 'tailwindcss'`、整站
  500：`.next/dev` 里的 Turbopack 缓存仍指向旧 `node_modules`，清缓存冷启动
  即恢复；新增 `pnpm run clean`，README 补充启动排错步骤。
- 深色模式刷新时 ThemeToggle 的 `aria-label`/`aria-pressed` 与 SSR 不一致导致
  hydration 报错：首帧固定为中性值，挂载后再反映真实主题。
- logo 跑马灯重复 React key 且每个 logo 相邻出现两次：改为整表复制两遍、
  key 带副本前缀。
- 工具卡片 meta 行在窄卡片上把标签压成逐字换行：chip 加 `shrink-0`
  - `whitespace-nowrap`，卡片挂 `@container`，窄卡片先隐藏域名。
- ⌘K 面板用 cmdk 的字面量过滤，与首页同义词检索结果不一致：关闭 cmdk 过滤，
  统一走 `filterTools`；Esc 关闭后焦点回到首页搜索框。
- 分类计数为 0 的分类按钮禁用；移动端 hero 的「本周王牌」独占一行；
  「清除全部」统一为「清除全部筛选」。
- 提交表单的 JSON 预览补实时状态（还差几项必填 / 已可复制），避免空表单
  看起来像可以直接提交。
- 分类页卡片改为显示「当前分类」而不是工具的主分类，避免在 /c/coding 里
  看到「对话助手」标签；详情页把受控特性和自由关键词分成两行。
- 卡片键盘停靠从 2 个降为 1 个：整卡「直达官网」外链改为 `tabIndex=-1`
  （鼠标/触屏仍生效，读屏链接列表保留），键盘只停在「详情」上；焦点进入
  卡片时用 `focus-within` 高亮整卡。
- 分类页新增「在全部工具中筛选」入口，直达 `/?cat=…` 并带出筛选 chip。
- 首页「本期精选」增加「换一批」，在 12 个人工编排的工具里每轮轮换 3 个。
- 详情页「官方入口」改为带标签的分行列表（官网 / GitHub / 文档 / 定价 / 商店），
  没有副链接时明确说明「暂未收录」，不再只显示一行域名。
- 移除未真正需要的 Geist Mono 字体（约 70KB woff2），等宽场景回退到系统字体；
  移动端首屏传输从约 500KB 降到 416KB。
- ⌘K 面板改为按需加载：cmdk 与 dialog 拆到 `search-palette` 异步 chunk，
  首次打开才下载（18KB raw / 6.9KB gzip），首屏不再携带。
- 详情页「同类工具」按「共同特性 ×3 + 共同平台 + 共同分类」排序，
  比原来的数组顺序更相关。
- 首页首批卡片从 48 降到 24：生产构建首页 HTML 278KB → 203KB（gzip 25KB），
  首屏 DOM 节点减半；滚动追加逻辑与筛选指纹不变。
- 同类工具卡片显示「同样支持 对话式 · 长文本 · 文件解析」，把排序理由露出来。
- 详情页去重：头部展示厂商/形态/定价/开源，右侧「基本信息」只留平台、状态、
  收录与核对时间，不再同一页重复四组字段。
- 首页加载更多处增加进度条（`role="progressbar"`，24/85），滚动时能看到
  已加载比例，不再只有一行小字。
- 品牌标抽成 `ToolLogo`：卡片、跑马灯、精选面板、详情页、⌘K 面板共用同一套
  图片/首字母占位，21 个无 logo 的工具不再出现三种不同长相。
- 跑马灯只取有 logo 的 16 个工具，装饰性滚动条里不再混入字母方块。
- 移动端「本周王牌」统一为「本期精选」，与桌面面板一致。
- ⌘K 打开时带上首屏搜索框里的关键词，接着当前搜索继续，而不是从空开始。
- about 页补「数据完整度」：64/85 有 logo、18/85 有仓库直链，文档与定价直链
  暂未收录，明确说明后续补齐。
- 精选面板「换一批」加了 220ms 淡入位移（`prefers-reduced-motion` 下关闭）。
- e2e 补齐 5 条：⌘K 打开与焦点回归、平台+特性筛选、分类页跳筛选、
  精选换一批、详情页官方入口；首屏用 `data-hydrated` 等水合再按键。
- e2e 再补 2 条移动端用例：移动端筛选抽屉、移动端详情页（含同类工具理由），
  全站 e2e 达 20 条。
- 无障碍：搜索快捷键按钮的 aria-label 含可见文本、详情页关键词与提交页
  分组标题对比度达 4.5:1、分类页补 h2 修正标题层级、JSON 预览滚动区可聚焦。
- 首页补站点级 JSON-LD：`WebSite` + `Organization` + `SearchAction`
  （`/?q={search_term_string}` 与现有搜索参数一致）。
- 筛选面板补齐「平台」与「特性」两个维度：59 个受控特性按 5 组展示，
  每项带实时计数；`?platform=`、`?feature=` 与分类/定价/授权一样写入 URL，
  已选条件以 chip 形式回显并可单个移除。

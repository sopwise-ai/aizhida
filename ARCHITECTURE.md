# 架构说明

## 目录结构

```text
app/                  App Router 路由与元数据文件
  layout.tsx          根布局：字体、metadata、页头页脚、跳转链接
  page.tsx            首页（静态壳，交互在 ToolsExplorer）
  about/  submit/     收录标准、提交工具
  tools/[id]/         工具详情页（generateStaticParams 全量预渲染）
  c/[category]/       分类落地页（11 个 SEO hub，SSG）
  error.tsx           路由段错误边界（客户端，带重试）
  global-error.tsx    根错误边界（内联样式，不依赖布局）
  loading.tsx         路由段加载态
  not-found.tsx       404
  manifest.ts         PWA manifest（/manifest.webmanifest）
  robots.ts           爬虫规则
  sitemap.ts          站点地图
  globals.css         Tailwind 4 主题令牌（@theme inline + shadcn 变量）
components/
  ui/                 shadcn/ui 原语（vendored，不写业务逻辑）
  app-providers.tsx   next-themes + Tooltip + sonner 的 provider 组合
  brand-mark.tsx      品牌 SVG 标识
  theme-toggle.tsx    明暗切换
  layout/             SiteHeader / SiteFooter
  tools/              ToolsExplorer（搜索、分类、筛选、URL 同步）、ToolCard、FilterSheet、SearchCommand（⌘K）
  submit/             SubmitForm（本地校验 + JSON 生成）
  seo/                JsonLd（唯一 JSON-LD 输出点，转义 "<"）
lib/
  env.ts              zod + t3-env 环境变量校验（只查语法）
  url.ts              站点 URL（服务端）：resolveSiteUrl 纯函数 + SITE_URL 校验
  site.ts             站点文案与链接常量（客户端安全，不含 env/zod）
  tools.ts            zod 校验 data/tools.json + 摘要/查询入口
  schema.ts           单条工具的 zod schema（不 import 数据文件）
  json-schema.ts      由 schema.ts 生成 JSON Schema 文本（生成物）
  summary.ts          客户端摘要投影（ToolSummary）与转换函数
  meta.ts             分类/形态/平台/特性/状态/定价词表、标签与字段限额
  vendors.ts          厂商注册表（零依赖，客户端安全；由 tools.ts 在构建期校验）
  logos.ts            logo 扩展名索引（public/logos/{id}.{ext}）
  search.ts           纯函数搜索、同义词扩展、多维筛选与评分排序
  utils.ts            cn() 类名合并
data/tools.json       工具数据（唯一数据源，构建期校验）
data/vendors.json     厂商注册表（与 tools.json 的 vendorId 对应）
data/schema/tools.schema.json  tools.json 的 JSON Schema（生成物，供编辑器/外部消费）
scripts/generate-json-schema.ts  pnpm schema:generate 的入口
public/               icon.svg、og.png、logos/{id}.{ext}（本地品牌图，无第三方请求）
e2e/                  Playwright：home.spec.ts（桌面）、mobile.spec.ts（Pixel 7）
```

## 渲染与缓存策略

- 全部路由为静态预渲染（构建时生成，无请求时数据）。
- 详情页 `/tools/[id]` 与分类页 `/c/[category]` 均由 `generateStaticParams` 在构建期
  全量生成（当前 85 + 11 个），`dynamicParams = false`：未知 id 直接 404，不做按需渲染。
- 首页交互（搜索/筛选/URL 状态）全部在客户端完成，服务端零数据库、零外部 API。
- 首屏只渲染前 24 张卡片，滚到底部由 `IntersectionObserver`（`rootMargin: 600px`）
  自动追加下一批；不支持 IO 的环境退化为「再显示 N 个」按钮。
  分页状态带筛选指纹，筛选一变即回到第一批。1000 条数据时 DOM 仍被限制在
  24–72 张卡片，同时保留 SSR 内容、`⌘F` 与可访问性。
- 筛选状态同步到 URL（`?q= &cat= &price= &source= &platform= &feature=`），
  刷新与分享链接均可还原。
- ⌘K 面板（cmdk + dialog）走 `search-palette` 异步 chunk，首次打开才下载；
  首屏不加载这部分代码。

## 数据流

```text
data/tools.json ──zod 校验（构建期）──> lib/tools.ts
data/vendors.json ──结构/唯一性 + 外键校验──> │
                                           ├─ tools（完整记录）────────> app/tools/[id]（详情页、SEO）
                                           └─ toolSummaries（摘要投影）──> 首页 / 分类页 / ⌘K 搜索
                                                                             （含 logo 路径，客户端不再单独加载映射表）
                                                      │
             search.ts（纯函数，单测覆盖）<──────┘
```

摘要投影是首屏预算的关键：`ToolSummary` 去掉 `description`、`links`、运营与日期字段，
只保留筛选/搜索/卡片所需的 14 个字段。首屏 24 张卡片时首页 HTML 约 203KB
（gzip 约 25KB），其中不含任何详情描述；1000 条时按同比例约 1.1–1.5MB（未压缩），
远低于全量记录。

数据更新只改 `data/tools.json`；字段非法时 `next build` 失败，保证线上数据始终合法。

### 字段契约的三层职责

| 层           | 位置                             | 职责                                                    |
| ------------ | -------------------------------- | ------------------------------------------------------- |
| 权威校验     | `lib/schema.ts` + `lib/tools.ts` | 构建期 zod：类型、长度、枚举、https、跨记录唯一性与外键 |
| 机器可读契约 | `data/schema/tools.schema.json`  | JSON Schema 2020-12：编辑器补全/内联错误、非 TS 消费者  |
| 展示词表     | `lib/meta.ts`                    | 枚举值、中文 label、描述、分组，同时派生 TS 联合类型    |

JSON Schema 由 zod **生成**，不手写：`pnpm schema:generate` 重写
`data/schema/tools.schema.json`，`lib/json-schema.test.ts` 在生成物与
schema 不一致时让 CI 失败。它只描述单条记录能表达的约束——id 唯一、官网唯一、
vendorId 外键、日期先后、数组去重无法用 JSON Schema 表达，仍由构建期兜底
（schema 的 `description` 里也写明了这一点）。

**站点常量的服务端/客户端分层**：`lib/site.ts` 只放字符串常量，
客户端可以直接导入；`lib/site.ts` 依赖 `env.ts`（zod），只允许服务端导入。
`components/**` 下导入 `@/lib/site` 或 `@/lib/env` 会被 biome 的
`noRestrictedImports` 直接拦下——起因是一次真实事故：客户端组件从
`site.ts` 取站名，把 zod 拖进首屏（约 90KB gzip），并在 Vercel 仅提供
`VERCEL_URL` 的部署里因浏览器读不到该变量而全站崩溃。

分类/平台/特性等枚举**刻意只在 `lib/meta.ts` 维护一份**：它们是封闭词表
加 UI 文案，不是会增长的实体（对比 `data/vendors.json`）。新增分类只改这一处，
`Category` 联合类型、筛选 UI、zod 枚举与生成的 JSON Schema 会一起更新；
再拆出 `categories.json`/`platforms.json` 会制造第二事实源。

### 数据模型（v2）

一条工具记录同时承载三类信息，字段名刻意保持正交：

| 维度     | 字段                                                      | 说明                                                       |
| -------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| 身份     | `id` / `name` / `vendorId`                                | `id` 发布后不可变；`vendorId` 外键指向 `data/vendors.json` |
| 归类     | `categories`（1–3）/ `type` / `platforms`（多值）         | 干什么 / 什么形态 / 跑在哪，三者不互相替代                 |
| 特性     | `features`（2–6，受控）                                   | 筛选词表，见 `FEATURES`；同义词只进 `keywords`             |
| 商业     | `pricing` / `openSource` / `affiliateUrl` / `sponsored`   | 联盟链接与官网分离                                         |
| 内容     | `tagline`（≤60）/ `description`（80–300）                 | 卡片用 tagline，详情页与 SEO 用 description                |
| 链接     | `links.website` / `github` / `docs` / `pricing` / `store` | 官网与仓库分离                                             |
| 生命周期 | `status` / `addedAt` / `updatedAt` / `verifiedAt`         | `verifiedAt` 为最近一次人工核对日期                        |

构建期额外做跨记录校验：id 唯一、官网唯一、vendorId 必须存在、
厂商 id 唯一且只含 id/name 两个字段（重复 id 会让 Map 静默覆盖，因此
`vendors.json` 与 `tools.json` 一样在构建期失败），
日期先后关系（`addedAt ≤ updatedAt`、`verifiedAt ≤ updatedAt`）、
分类/特性/平台数组去重。其中长度与枚举也已导出为 JSON Schema，
供编辑器在 `data/tools.json` 中即时提示。

`features` 与 `keywords` 的分工是 500 条以后不崩的关键：前者是封闭词表
（可筛选、可翻译），后者是自由检索词（不进筛选 UI、不建索引）。

## 测试策略

- **纯函数**（`search`、`tools`、`url`）：Vitest 单测，覆盖同义词、评分、维度组合。
- **路由元数据**（`robots`、`sitemap`、`manifest`）：直接调用导出函数断言。
- **组件**：Testing Library 渲染 + 交互（分类切换、空态建议、复制链接、表单校验）。
- **详情页**：说明文字、官网链接、canonical、JSON-LD（SoftwareApplication）与同类工具内链。
- **分类页**：每个分类的工具清单、跨分类内链、canonical 与 CollectionPage / ItemList JSON-LD。
- **端到端**：Playwright 走真实生产构建，断言标题、搜索、主题持久化、无障碍（axe）与安全响应头。

## 环境与安全

- `lib/env.ts` 用 t3-env 划分 client/server 变量；生产构建缺少 `NEXT_PUBLIC_SITE_URL` 或指向 localhost 时直接失败。
- 全站安全响应头由 `next.config.ts` 统一注入；CSP 采用静态优化友好的基线（`unsafe-inline` 脚本），后续接鉴权再按路由收紧。
- `instrumentation.ts`（`onRequestError`）输出结构化错误日志，路径丢弃 query string 以避免泄露敏感参数。
- CSP 的 `img-src` 只放行本地/blob/data：全站 logo 均为 `public/logos/` 静态资产，无第三方图片请求。

## 部署与运行

- 部署在 Vercel：`SITE_URL` 自动取生产域名，无需设置环境变量。
- 自托管：参考 cikuku 的 `output: "standalone"` + Docker 方案，需要时再引入。

## 有意与 cikuku 保持的差异

| 决策                                            | 原因                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| 保留 Biome（不换 ESLint+Prettier 双轨）         | Biome 单工具覆盖 lint+format，速度更快；Prettier 只负责 Tailwind 类排序 |
| 不启用 `cacheComponents` / `partialPrefetching` | 全站静态站，无请求时数据，收益为零，徒增心智负担                        |
| 不引入 React Query                              | 无服务端状态，客户端数据即 URL + 静态 JSON                              |
| 未加 Docker/standalone                          | 当前部署在 Vercel；需要自托管时引入（cikuku 有现成模板）                |
| 覆盖率阈值 70/60                                | 组件库较小，先保证 lib 全覆盖；随功能增长可上调                         |

# 架构说明

## 目录结构

```text
app/                  App Router 路由与元数据文件
  layout.tsx          根布局：字体、metadata、页头页脚、跳转链接
  page.tsx            首页（静态壳，交互在 ToolsExplorer）
  about/  submit/     收录标准、提交工具
  error.tsx           路由段错误边界（客户端，带重试）
  global-error.tsx    根错误边界（内联样式，不依赖布局）
  loading.tsx         路由段加载态
  not-found.tsx       404
  manifest.ts         PWA manifest（/manifest.webmanifest）
  robots.ts sitemap.ts
components/
  ui/                 shadcn/ui 原语（vendored，不写业务逻辑）
  layout/             SiteHeader / SiteFooter
  tools/              ToolsExplorer（搜索、分类、筛选、URL 同步）、ToolCard、FilterSheet、SearchCommand（⌘K）
  submit/             SubmitForm（本地校验 + JSON 生成）
lib/
  env.ts              zod + t3-env 环境变量校验（构建期失败）
  site.ts             站点常量 + 生产 URL 断言
  tools.ts            zod 校验 data/tools.json（非法数据直接让构建失败）
  tool-meta.ts        分类/定价/平台枚举与标签
  filter-tools.ts     纯函数搜索、同义词扩展、多维筛选与评分排序
  tool-logos.ts       本地 logo 资产映射
data/tools.json       工具数据（唯一数据源，构建期校验）
e2e/                  Playwright：home.spec.ts（桌面）、mobile.spec.ts（Pixel 7）
```

## 渲染与缓存策略

- 全部路由为静态预渲染（构建时生成，无请求时数据）。
- 首页交互（搜索/筛选/URL 状态）全部在客户端完成，服务端零数据库、零外部 API。
- 筛选状态同步到 URL（`?q= &cat= &price= &source=`），刷新与分享链接均可还原。

## 数据流

```text
data/tools.json ──zod 校验（构建期）──> lib/tools.ts ──props──> ToolsExplorer
                                                      │
             filter-tools.ts（纯函数，单测覆盖）<──────┘
```

数据更新只改 `data/tools.json`；字段非法时 `next build` 失败，保证线上数据始终合法。

## 测试策略

- **纯函数**（`filter-tools`、`tools`、`site`）：Vitest 单测，覆盖同义词、评分、维度组合。
- **路由元数据**（`robots`、`sitemap`、`manifest`）：直接调用导出函数断言。
- **组件**：Testing Library 渲染 + 交互（分类切换、空态建议、复制链接、表单校验）。
- **端到端**：Playwright 走真实生产构建，断言标题、搜索、主题持久化、无障碍（axe）与安全响应头。

## 环境与安全

- `lib/env.ts` 用 t3-env 划分 client/server 变量；生产构建缺少 `NEXT_PUBLIC_SITE_URL` 或指向 localhost 时直接失败。
- 全站安全响应头由 `next.config.ts` 统一注入；CSP 采用静态优化友好的基线（`unsafe-inline` 脚本），后续接鉴权再按路由收紧。

## 有意与 cikuku 保持的差异

| 决策                                            | 原因                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| 保留 Biome（不换 ESLint+Prettier 双轨）         | Biome 单工具覆盖 lint+format，速度更快；Prettier 只负责 Tailwind 类排序 |
| 不启用 `cacheComponents` / `partialPrefetching` | 全站静态站，无请求时数据，收益为零，徒增心智负担                        |
| 不引入 React Query                              | 无服务端状态，客户端数据即 URL + 静态 JSON                              |
| 未加 Docker/standalone                          | 当前部署在 Vercel；需要自托管时引入（cikuku 有现成模板）                |
| 覆盖率阈值 70/60                                | 组件库较小，先保证 lib 全覆盖；随功能增长可上调                         |

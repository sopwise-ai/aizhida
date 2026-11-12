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

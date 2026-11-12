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

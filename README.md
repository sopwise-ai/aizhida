# AI 直达（aizhida）

精选 AI 工具导航：只收王牌，一键直达官网。基于 Next.js 16 App Router、TypeScript、Tailwind CSS 4 与 shadcn/ui。

## 环境要求

- Node.js ≥ 26.13.0（见 [`.nvmrc`](.nvmrc)，`.npmrc` 开启 `engine-strict` 强制校验）
- pnpm 10（`packageManager` 字段锁定）

## 编辑器

- [`.editorconfig`](.editorconfig)：统一缩进、行尾、UTF-8。
- [`.vscode/settings.json`](.vscode/settings.json)：保存时 Prettier 格式化、Tailwind 类名补全。
- [`.vscode/extensions.json`](.vscode/extensions.json)：推荐 Biome、Prettier、Tailwind CSS、EditorConfig 插件。

## shadcn/ui

项目使用 shadcn/ui（`components.json` 已配置，风格 `radix-nova`、lucide 图标）。
组件源码在 [`components/ui/`](components/ui) 中，由 CLI 管理：

```bash
pnpm exec shadcn add dialog        # 添加新组件
pnpm exec shadcn add button --diff # 预览上游更新
```

## 快速开始

```bash
pnpm install
pnpm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 脚本

| 命令                     | 说明                                            |
| ------------------------ | ----------------------------------------------- |
| `pnpm run dev`           | 启动开发服务器                                  |
| `pnpm run build`         | 生产构建                                        |
| `pnpm run start`         | 启动生产服务器                                  |
| `pnpm run lint`          | Biome 检查（格式 + lint）                       |
| `pnpm run format`        | Prettier 写入格式                               |
| `pnpm run format:check`  | 校验格式                                        |
| `pnpm run typecheck`     | TypeScript 类型检查                             |
| `pnpm run knip`          | 死代码 / 未用导出 / 多余依赖检测                |
| `pnpm run test`          | 运行单元测试                                    |
| `pnpm run test:watch`    | 测试观察模式                                    |
| `pnpm run test:coverage` | 测试 + 覆盖率阈值（行/语句/分支 70%，函数 60%） |
| `pnpm run test:e2e`      | Playwright 端到端测试（桌面 + 移动）            |

## 环境变量

复制 `.env.example` 为 `.env.local`。

| 变量                        | 必填     | 说明                                                                                                                                      |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | 生产必填 | 站点公开地址，`sitemap.xml`、`robots.txt`、OG 都依赖它。缺失或指向 localhost 时生产构建直接失败。部署在 Vercel 可不填（自动取生产域名）。 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 可选     | 提交工具的备用邮箱；留空则只展示复制 JSON 与 GitHub Issue。                                                                               |

`NEXT_PUBLIC_*` 在构建期内联，请在 `pnpm run build` 之前设置。

校验逻辑位于 [`lib/env.ts`](lib/env.ts)（zod + t3-env）与 [`lib/site.ts`](lib/site.ts)（生产断言）。

## 质量门禁

- **格式**：Prettier（含 Tailwind 类名排序），CI 强制。
- **Lint**：Biome 2，含 a11y 与正确性规则。
- **类型**：`tsc --noEmit`。
- **死代码**：Knip（shadcn/ui 原语只豁免未用导出）。
- **单测**：Vitest + Testing Library，覆盖率阈值 70% 行/语句/分支、60% 函数。
- **E2E**：Playwright，Chromium 桌面 + Pixel 7 移动，含 axe 可访问性扫描与安全响应头断言。
- **构建**：生产构建必须提供 `NEXT_PUBLIC_SITE_URL`；CI 同时验证“缺 URL 必须构建失败”。

## 安全响应头

[`next.config.ts`](next.config.ts) 为全站注入：CSP、`X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options: DENY`、`Permissions-Policy`，生产环境追加 HSTS。`poweredByHeader` 已关闭。

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) 在 PR 与 main push 上运行：format → lint → typecheck → knip → 单测（覆盖率）→ 构建 → URL 必填校验 → Playwright E2E → PR 标题（Conventional Commits）。

## Git 钩子

Husky + lint-staged：提交时先以只读模式跑 biome lint（暂存文件），再由 prettier 格式化；commit message 由 commitlint 按 Conventional Commits 校验。CI 中用 `HUSKY=0` 跳过。

## 参与贡献

`main` 受分支规则保护（禁止直接推送），所有变更走 Pull Request。
流程与提交规范见 [CONTRIBUTING.md](CONTRIBUTING.md)；更新记录见
[CHANGELOG.md](CHANGELOG.md)；安全漏洞见 [SECURITY.md](SECURITY.md)
（请勿公开 Issue）；项目协议 [MIT](LICENSE)。

## 部署

Vercel 开箱即用（`SITE_URL` 自动取生产域名）。自托管可参考 cikuku 的 `output: "standalone"` + Docker 方案，需要时再引入。

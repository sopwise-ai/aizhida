# 贡献指南

## 环境要求

- Node.js ≥ 26.13.0（见 [`.nvmrc`](.nvmrc)，`.npmrc` 强制校验）
- pnpm 10

## 工作流

1. 从 `main` 创建分支：
   - `feat/<简短描述>`、`fix/<简短描述>`、`chore/<简短描述>`、`docs/<简短描述>`

2. 使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)
   提交：`build:`、`chore:`、`ci:`、`docs:`、`feat:`、`fix:`、`perf:`、
   `refactor:`、`revert:`、`style:`、`test:`。

   `pnpm install` 会通过 husky 安装钩子：

   - `pre-commit` 运行 lint-staged，只处理暂存文件（biome + prettier）。
   - `commit-msg` 运行 commitlint，拒绝不合规范的提交信息。

   `git commit --no-verify` 可以绕过钩子，但 CI 会执行相同的检查。

3. 本地运行检查。`pnpm run build` 需要 `NEXT_PUBLIC_SITE_URL`，
   先复制 `.env.example` 为 `.env.local`。

   ```bash
   pnpm run format:check
   pnpm run lint
   pnpm run typecheck
   pnpm run knip
   pnpm run test
   pnpm run test:e2e
   pnpm run build
   ```

   端到端测试需要先安装一次浏览器：
   `pnpm exec playwright install chromium`。

4. 发起 Pull Request，标题遵循 Conventional Commits
   （CI 会校验 squash 合并时的 PR 标题），确保 CI 通过。

## 新增 UI 组件

项目用 shadcn/ui 管理组件（见 [`components.json`](components.json)）：

```bash
pnpm exec shadcn add dialog   # 添加新组件到 components/ui/
```

不要手写 `components/ui/` 下的原语，保持与上游 registry 可对比、可更新。

## 更新工具数据

编辑 [`data/tools.json`](data/tools.json)。字段经 zod 校验
（见 [`lib/tools.ts`](lib/tools.ts)），id 重复、非 https 链接、超长说明
都会让构建失败——这是有意设计，保证线上数据始终合法。

## 提交收录

工具收录流程见站内 `/submit` 与 `/about`，不走代码 PR。

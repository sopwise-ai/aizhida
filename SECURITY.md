# 安全策略

## 支持的版本

| 版本  | 支持情况 |
| ----- | -------- |
| 0.1.x | ✅       |

## 报告漏洞

请通过 GitHub 的
[私密漏洞报告](https://github.com/sopwise-ai/aizhida/security/advisories/new)
私下报告安全问题。

**不要**为安全漏洞开设公开 Issue。我们会确认收到报告、调查问题，
并与你协调修复和披露时间。

## 内容安全策略（CSP）

所有路由都发送基线 Content-Security-Policy（见
[`next.config.ts`](next.config.ts)）。

- `script-src` 允许 `'unsafe-inline'`：App Router 会内联引导脚本，而
  nonce CSP 会迫使动态渲染、与全站静态优化冲突。
- `script-src-attr 'none'` 阻止内联事件处理器（如 `onclick=`）。

该基线限制了可加载资源的来源，但**不是** XSS 的完整防线。如果某个路由
需要更强的策略，可在该路由单独下发更严格的 CSP 头。

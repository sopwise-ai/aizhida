import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

/** 只能在服务端导入的模块：要么在构建期读数据，要么依赖 zod / 进程环境。 */
const SERVER_ONLY_MODULES = new Set([
  "@/lib/tools",
  "@/lib/tool-schema",
  "@/lib/tool-json-schema",
  "@/lib/site",
  "@/lib/env",
]);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory()
      ? walk(path)
      : /\.(ts|tsx)$/.test(entry.name)
        ? [path]
        : [];
  });
}

function clientFiles(): string[] {
  return [
    ...walk(join(projectRoot, "components")),
    ...walk(join(projectRoot, "app")),
  ].filter((file) => /^\s*["']use client["']/.test(readFileSync(file, "utf8")));
}

function importsOf(source: string): string[] {
  return [...source.matchAll(/(?:from|import|import\()\s*["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((specifier): specifier is string => Boolean(specifier));
}

/**
 * 架构不变量：客户端组件的导入链里不能出现服务端模块。
 * 起因是一次真实事故：客户端组件从 site.ts 取站名，把 zod 拖进首屏，
 * 并在 Vercel 仅提供 VERCEL_URL 的部署里让浏览器读不到变量而崩溃。
 * biome 只能按目录拦（分不清 "use client"），这里按指令精确检查。
 */
describe("client boundary", () => {
  it("keeps server-only modules out of client components", () => {
    const violations: string[] = [];

    for (const file of clientFiles()) {
      for (const specifier of importsOf(readFileSync(file, "utf8"))) {
        if (SERVER_ONLY_MODULES.has(specifier)) {
          violations.push(`${relative(projectRoot, file)} -> ${specifier}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

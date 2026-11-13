import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";
import { toolsJsonSchemaText } from "../lib/tool-json-schema.ts";

/**
 * 由 lib/tool-schema.ts 生成 data/schema/tools.schema.json。
 * 生成物随代码提交；lib/tool-json-schema.test.ts 会在漂移时让 CI 失败。
 *
 * 写入前用仓库的 Prettier 配置格式化，保证 `pnpm format:check` 通过，
 * 也避免有人再手动跑一次 format 产生无意义 diff。
 */
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(projectRoot, "data/schema/tools.schema.json");

const config = (await prettier.resolveConfig(target)) ?? {};
const output = await prettier.format(toolsJsonSchemaText, {
  ...config,
  parser: "json",
});

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, output);

console.log(`已生成 ${target}`);

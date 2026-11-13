import { z } from "zod";
import { toolSchema } from "./schema.ts";

/**
 * data/tools.json 的 JSON Schema（draft 2020-12），完全由 toolSchema 生成。
 *
 * 用途：编辑器即时提示（.vscode/settings.json 的 json.schemas）、
 * CI 漂移检测（lib/json-schema.test.ts），以及给非 TS 消费者
 * 一份可读的字段契约。它不替代构建期校验。
 */
const toolsJsonSchema = z.toJSONSchema(z.array(toolSchema).min(1), {
  target: "draft-2020-12",
});

/**
 * 生成物，勿手改：运行 `pnpm schema:generate` 重写。
 *
 * 这里还列出 JSON Schema 表达不了的跨记录约束，避免读 schema 的人
 * 误以为「通过 JSON Schema 就等于数据合法」。
 */
const GENERATED_NOTE =
  "生成物，勿手改，运行 pnpm schema:generate 重写。本文件只描述数据结构与格式；关键词小写、链接不含账号密码、文本无首尾空格等 refine，以及 id 唯一、官网唯一、vendorId 必须存在于 data/vendors.json、addedAt ≤ updatedAt、verifiedAt ≤ updatedAt 等跨记录约束，只在构建期由 lib/schema.ts 与 lib/tools.ts 校验。";

export const toolsJsonSchemaText = `${JSON.stringify(
  {
    ...toolsJsonSchema,
    title: "aizhida data/tools.json",
    description: GENERATED_NOTE,
  },
  null,
  2,
)}\n`;

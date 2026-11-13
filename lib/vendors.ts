import rawVendors from "@/data/vendors.json";
import type { Vendor } from "./meta";

/**
 * 厂商注册表。刻意不在这里引入 zod：search.ts 也会用到 vendorName，
 * 而它是客户端模块，不应该把校验库带进浏览器包。
 *
 * 结构与唯一性在构建期由 lib/tools.ts 的 vendorsSchema 校验（重复 id 会让
 * Map 静默覆盖，必须失败）；vendorId 外键由 toolsSchema 兜底。
 */
export const vendors: readonly Vendor[] = rawVendors;

const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor]));

export function getVendor(id: string): Vendor | undefined {
  return vendorsById.get(id);
}

export function vendorName(id: string): string {
  return vendorsById.get(id)?.name ?? id;
}

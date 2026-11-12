import rawVendors from "@/data/vendors.json";
import type { Vendor } from "./tool-meta";

/**
 * 厂商注册表。刻意不在这里引入 zod：filter-tools 也会用到 vendorName，
 * 而它是客户端模块，不应该把校验库带进浏览器包。数据完整性由
 * lib/vendors.test.ts 与 lib/tools.ts 的 vendorId 外键检查兜底。
 */
export const vendors = rawVendors as Vendor[];

const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor]));

export function getVendor(id: string): Vendor | undefined {
  return vendorsById.get(id);
}

export function vendorName(id: string): string {
  return vendorsById.get(id)?.name ?? id;
}

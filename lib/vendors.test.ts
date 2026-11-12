import { describe, expect, it } from "vitest";
import { tools } from "./tools";
import { getVendor, vendorName, vendors } from "./vendors";

describe("vendor registry", () => {
  it("has unique, slug-shaped ids", () => {
    const ids = new Set(vendors.map((vendor) => vendor.id));
    expect(ids.size).toBe(vendors.length);
    for (const vendor of vendors) {
      expect(vendor.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(vendor.name.length).toBeGreaterThan(0);
    }
  });

  it("is fully referenced by the dataset", () => {
    const used = new Set(tools.map((tool) => tool.vendorId));
    for (const vendor of vendors) {
      expect(used.has(vendor.id)).toBe(true);
    }
  });

  it("resolves vendor display names", () => {
    expect(getVendor("openai")?.name).toBe("OpenAI");
    expect(vendorName("openai")).toBe("OpenAI");
    // 未知 vendor 退回 id，方便在 UI 上至少看到原值。
    expect(vendorName("unknown-vendor")).toBe("unknown-vendor");
  });
});

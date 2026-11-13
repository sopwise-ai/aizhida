import { describe, expect, it } from "vitest";
import { tools, vendorsSchema } from "./tools";
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

  it("rejects duplicate ids at build time", () => {
    const result = vendorsSchema.safeParse([
      { id: "openai", name: "OpenAI" },
      { id: "openai", name: "OpenAI 2" },
    ]);

    expect(result.success).toBe(false);
  });

  it("rejects malformed or bloated registry entries", () => {
    expect(
      vendorsSchema.safeParse([{ id: "Open AI", name: "X" }]).success,
    ).toBe(false);
    expect(vendorsSchema.safeParse([{ id: "openai", name: "" }]).success).toBe(
      false,
    );
    expect(
      vendorsSchema.safeParse([{ id: "openai", name: "OpenAI", url: "x" }])
        .success,
    ).toBe(false);
  });

  it("resolves vendor display names", () => {
    expect(getVendor("openai")?.name).toBe("OpenAI");
    expect(getVendor("unknown-vendor")).toBeUndefined();
    expect(vendorName("openai")).toBe("OpenAI");
    // 未知 vendor 退回 id，方便在 UI 上至少看到原值。
    expect(vendorName("unknown-vendor")).toBe("unknown-vendor");
  });

  it("resolves every tool vendor to a registered vendor", () => {
    for (const tool of tools) {
      expect(getVendor(tool.vendorId)?.id).toBe(tool.vendorId);
    }
  });
});

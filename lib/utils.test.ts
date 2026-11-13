import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("lets later utilities win within the same group", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("ignores falsy and flattens array inputs", () => {
    expect(cn(["flex", null, undefined, false], "flex")).toBe("flex");
  });

  it("resolves conditional class objects", () => {
    expect(cn("text-sm", { "text-lg": true, "font-bold": false })).toBe(
      "text-lg",
    );
  });

  it("keeps variants independent", () => {
    expect(cn("bg-red-500 hover:bg-blue-500", "bg-green-500")).toBe(
      "hover:bg-blue-500 bg-green-500",
    );
  });

  // 回归守卫：这些是 Tailwind v4 才有的语法，tailwind-merge 大版本升级
  // 若丢掉解析能力，className 覆盖会静默失效（例如 card.tsx 的 px-(--card-spacing)）。
  it("understands Tailwind v4 syntax", () => {
    expect(cn("px-2", "px-(--card-spacing)")).toBe("px-(--card-spacing)");
    expect(cn("w-4 h-4", "size-6")).toBe("size-6");
    expect(cn("shadow-sm", "shadow-xs")).toBe("shadow-xs");
    expect(cn("data-[state=open]:bg-a", "data-[state=open]:bg-b")).toBe(
      "data-[state=open]:bg-b",
    );
  });
});

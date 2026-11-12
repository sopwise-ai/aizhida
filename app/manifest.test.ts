import { describe, expect, it } from "vitest";

import manifest from "./manifest";

describe("manifest", () => {
  it("describes the PWA identity", () => {
    const data = manifest();
    expect(data.name).toBe("AI 直达");
    expect(data.start_url).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.icons?.length ?? 0).toBeGreaterThan(0);
  });
});

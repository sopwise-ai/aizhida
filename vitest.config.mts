import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "jsdom",
    // globals 打开后 @testing-library/react 会在每个用例间自动 cleanup。
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // jsdom + userEvent 的用例在并行跑满时会排队：默认 5s 对表单类交互偏紧，
    // 15s 仍能在真挂起时快速失败。
    testTimeout: 15_000,
    include: [
      "app/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
    ],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "app/**/*.d.ts",
        "app/layout.tsx",
        "app/global-error.tsx",
        "components/ui/**",
        "**/*.test.{ts,tsx}",
      ],
      thresholds: {
        lines: 70,
        functions: 60,
        branches: 70,
        statements: 70,
      },
    },
  },
});

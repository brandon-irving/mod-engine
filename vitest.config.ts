import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        "dist/**",
        "examples/**",
        "tests/**",
        "*.config.*",
        "src/index.ts", // Just exports, no logic to test
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      all: true,
      reportOnFailure: true,
    },
  },
});

import { configDefaults, defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: [
      ...configDefaults.exclude,
      "**/.storybook/**",
      "src/stories/**",
      "**/*.stories/**",
      "tools/generate-feature/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "cobertura", "json-summary"],
      reportsDirectory: "./coverage",
      all: true,
      exclude: [
        "**/.pnpm-store/**",
        "**/node_modules/**",
        "**/.storybook/**",
        "src/stories/**",
        "**/*.stories/**",
      ],

      include: [
        "src/**/utils/**/*.{ts,js}",
        "src/**/_utils/**/*.ts",
        "src/**/utils.ts",
        "src/hooks/**/*.{ts,tsx}",
        "src/**/_hooks/**/*.{ts,tsx}",
        "src/**/schema{s,}.ts",
        "src/components/**/*.ts",
        "src/**/lib/**/*.ts",
        "src/**/route.ts",
        "src/middleware.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@common": path.resolve(__dirname, "src/common"),
      "@dbaas": path.resolve(__dirname, "src/app/[locale]/dbaas"),
    },
  },
});

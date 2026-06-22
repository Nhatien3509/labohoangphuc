import storybook from "eslint-plugin-storybook";

import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

import { BASE_RULES } from "./tools/lint/eslint/base-rules.mjs";
import { ESLINT_IGNORES } from "./tools/lint/eslint/ignores.mjs";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./.storybook/tsconfig.json", // 👈 include Storybook
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: BASE_RULES,
  },

  {
    files: ["src/common/i18n/request.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    ignores: ESLINT_IGNORES,
  },

  {
    files: [".storybook/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./.storybook/tsconfig.json"], // 👈 chỉ dùng tsconfig Storybook
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/no-array-delete": "warn",
      "@typescript-eslint/require-await": "warn",
    },
  },

  storybook.configs["flat/recommended"],
);

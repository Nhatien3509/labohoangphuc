/** @type {import("eslint").Linter.RulesRecord} */
export const BASE_RULES = {
  "@typescript-eslint/array-type": "off",
  "@typescript-eslint/consistent-type-definitions": "off",
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      fixStyle: "inline-type-imports",
      prefer: "type-imports",
    },
  ],
  "@typescript-eslint/require-await": "error",
  "@typescript-eslint/no-base-to-string": "off",
  "@typescript-eslint/restrict-template-expressions": "off",

  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      args: "all",
      argsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      ignoreRestSiblings: true,
      varsIgnorePattern: "^_",
    },
  ],

  "no-duplicate-imports": "error",
  "sort-imports": [
    "error",
    {
      allowSeparatedGroups: true,
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
    },
  ],
};

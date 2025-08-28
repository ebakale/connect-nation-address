import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Prevent hardcoded strings in components (except test files)
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXText[value=/[a-zA-Z]{3,}/]",
          message: "Hardcoded strings in JSX are not allowed. Use i18n translation keys instead."
        },
        {
          selector: "Literal[value=/^[a-zA-Z\\s]{4,}$/]",
          message: "Hardcoded string literals are not allowed. Use i18n translation keys instead."
        }
      ]
    },
  }
);

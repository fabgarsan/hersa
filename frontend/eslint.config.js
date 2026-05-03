import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import path from "path";

// Local plugin: enforces the co-located SCSS module convention.
// Every .tsx file that renders JSX must:
//   1. import styles from './ComponentName.module.scss'  (default named "styles")
//   2. The module filename must match the component filename
const hersaStylePlugin = {
  name: "hersa-style",
  rules: {
    "require-scss-module": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          missingImport:
            "Component '{{basename}}.tsx' must import its co-located SCSS module: import styles from './{{module}}'",
          wrongName:
            "CSS Module default import must be named 'styles', found '{{name}}'",
          wrongFile:
            "Expected CSS Module import './{{expected}}' but found '{{found}}'",
        },
      },
      create(context) {
        const filename = context.filename;
        if (!filename.endsWith(".tsx")) return {};

        // Skip test files
        if (filename.endsWith(".test.tsx")) return {};

        const basename = path.basename(filename, ".tsx");
        if (basename === "main") return {};
        if (basename.endsWith("Provider")) return {};

        const expectedModule = `${basename}.module.scss`;
        let hasScssImport = false;
        let hasJsx = false;

        return {
          JSXElement() {
            hasJsx = true;
          },
          JSXFragment() {
            hasJsx = true;
          },
          ImportDeclaration(node) {
            const src = node.source.value;
            if (!src.endsWith(".module.scss")) return;

            hasScssImport = true;

            const specifier = node.specifiers.find(
              (s) => s.type === "ImportDefaultSpecifier",
            );
            if (specifier && specifier.local.name !== "styles") {
              context.report({
                node: specifier,
                messageId: "wrongName",
                data: { name: specifier.local.name },
              });
            }

            if (path.basename(src) !== expectedModule) {
              context.report({
                node,
                messageId: "wrongFile",
                data: { expected: expectedModule, found: src },
              });
            }
          },
          "Program:exit"(node) {
            if (hasJsx && !hasScssImport) {
              context.report({
                node,
                messageId: "missingImport",
                data: { basename, module: expectedModule },
              });
            }
          },
        };
      },
    },
  },
};

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
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "hersa-style": hersaStylePlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/no-array-index-key": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@mui/material",
              message:
                "Use direct imports: import Box from '@mui/material/Box'",
            },
            {
              name: "@mui/icons-material",
              message:
                "Use direct imports: import Add from '@mui/icons-material/Add'",
            },
          ],
        },
      ],
      "hersa-style/require-scss-module": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='sx']",
          message:
            "Do not use the MUI 'sx' prop. Use className={styles.xxx} from the co-located SCSS module.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'][value.type='JSXExpressionContainer'][value.expression.type='ObjectExpression']",
          message:
            "Do not use inline style={{}} objects. Use className={styles.xxx} from the co-located SCSS module.",
        },
      ],
    },
  },
  // Test files: relax rules that are impractical to satisfy in mocks
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}", "**/tests/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
  eslintConfigPrettier,
);

import tseslint from "typescript-eslint";
import baseConfig from "../../eslint.config.mjs";
import eslintConfigPrettier from "eslint-config-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = [
  ...baseConfig,
  // TypeScript-specific config
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: path.resolve(__dirname, "tsconfig.json"),
        tsconfigRootDir: __dirname,
        extraFileExtensions: [".ts"]
      }
    },
    rules: {}
  },
  {
    ignores: ["**/*.js"]
  },
  // This must be last to disable ESLint formatting rules
  eslintConfigPrettier
];

export default config;

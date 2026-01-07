import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [
      'packages/*/!(src)/**',
      '.dev-certs',
      '**/.dev-certs',
      '.wireit',
      '**/.wireit',
      'dist',
      '**/dist',
      '.vite',
      '**/.vite',
      '**/coverage',
      '.rollup.cache',
      '**/.rollup.cache',
      'node_modules',
      '**/node_modules',
    ]
  },
  // Base recommended configs
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: path.resolve(__dirname, "tsconfig.json"),
        tsconfigRootDir: __dirname,
        extraFileExtensions: [".vue", ".ts"]

      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
      }
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
    }
  }
];

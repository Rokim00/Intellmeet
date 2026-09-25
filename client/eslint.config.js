import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      '@/**/*.{ts,tsx}',
      'src/context/AuthContext.tsx',
      'src/context/ProjectContext.tsx',
      'src/context/OrganizationContext.tsx',
    ],
    rules: {
      // Context files export both a provider component and its consumer hook,
      // which is the standard pattern. Fast Refresh loses per-file state for
      // them, but splitting every hook into its own file harms readability more
      // than the HMR benefit is worth.
      'react-refresh/only-export-components': 'off',
    },
  },
])

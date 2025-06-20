/**
 * ESLint Konfiguration:
 * 
 * - Ignoriert den Ordner "dist"
 * - Für JS und JSX Dateien
 * - ECMAScript 2020 / neueste Version
 * - Browser-Globals aktiviert
 * - JSX-Syntax erlaubt
 * - Nutzt Plugins:
 *    • react-hooks (Regeln für React Hooks)
 *    • react-refresh (für React Fast Refresh, z.B. in dev mode)
 * - Regeln:
 *    • empfohlene JS-Regeln
 *    • empfohlene react-hooks-Regeln
 *    • Fehler bei ungenutzten Variablen, außer Variablen die mit Großbuchstaben oder Unterstrich beginnen (z.B. React-Komponenten)
 *    • Warnung wenn nicht nur React-Komponenten exportiert werden (react-refresh)
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    // https://github.com/import-js/eslint-plugin-import#typescript
    'import',
    'react-hooks',
  ],
  rules: {
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': false
    }],
    'react-hooks/exhaustive-deps': ['error', {
      'additionalHooks': '(useLoginCallback|useAuthRequired)'
    }],
    "react-hooks/rules-of-hooks": 'error',
  },
  settings: {
    // https://github.com/import-js/eslint-plugin-import#typescript
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    }
  },
}

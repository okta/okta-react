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
  ],
  rules: {
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': false
    }],
    // `src/client-js/**` is the optional, independently-bundled `@okta/okta-react/client-js` entry point.
    // The default `okta-react` bundle must have zero import edges into it.
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md
    'import/no-restricted-paths': ['error', {
      zones: [{
        target: './src',
        from: './src/client-js',
        message: 'src/client-js/** is a separate, optional bundle - do not import it from the default okta-react entry point.'
      }]
    }],
    // ...nor may the default bundle depend on the client-js peer SDKs directly. These are
    // `patterns`, not `paths`, so that subpath entry points (e.g. `@okta/spa-platform/flows`)
    // are caught too - `paths` only matches the exact specifier.
    'no-restricted-imports': ['error', {
      patterns: ['@okta/auth-foundation', '@okta/oauth2-flows', '@okta/spa-platform'].map(name => ({
        group: [name, `${name}/*`],
        message: `${name} may only be imported from src/client-js/** - the default okta-react bundle must not depend on it.`
      }))
    }]
  },
  settings: {
    // https://github.com/import-js/eslint-plugin-import#typescript
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    }
  },
  overrides: [
    {
      files: ['client-js/**/*'],
      rules: {
        'import/no-restricted-paths': 'off',
        'no-restricted-imports': 'off'
      }
    }
  ]
}

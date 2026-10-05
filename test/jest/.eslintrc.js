module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    jest: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 0
  },
  overrides: [
    {
      // jest.environment.js is loaded by jest itself, so it has to stay CommonJS
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0
      }
    }
  ]
}

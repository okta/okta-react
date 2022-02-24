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
  }
}

// https://eslint.org/docs/user-guide/configuring

const packageJson = require('../package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/explicit-function-return-type': 0
  }
};

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
  ]
};

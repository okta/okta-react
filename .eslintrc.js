// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parser: 'babel-eslint',
  plugins: [
    'react',
    'react-hooks'
  ],
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  rules: {
    'react/prop-types': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'semi': ['error', 'always'],
  },
  settings: {
    react: {
      version: '16.8',
    }
  }
};

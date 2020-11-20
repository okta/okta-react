module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'plugin:jasmine/recommended'
  ],
  plugins: ['jasmine'],
  env: {
    jasmine: true
  },
  rules: {
    'jasmine/new-line-before-expect': 0
  }
};

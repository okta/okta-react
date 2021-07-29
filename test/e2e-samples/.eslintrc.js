module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'plugin:protractor/recommended',
    'plugin:jasmine/recommended'
  ],
  plugins: [
    'jasmine',
    'protractor'
  ],
  env: {
    jasmine: true,
    node: true,
    es6: true
  },
  rules: {
    'jasmine/new-line-before-expect': 0,
    'protractor/missing-wait-message': 0,
    'protractor/no-browser-sleep': 0,
    'protractor/no-get-in-it': 0
  },
  globals: {
    '$': true
  }
};

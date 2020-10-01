// https://eslint.org/docs/user-guide/configuring

const packageJson = require('./package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  rules: {
    'node/no-unpublished-require': ['error', {
      'allowModules': devDependencies
    }],
    'node/no-unpublished-import': ['error', {
      'allowModules': devDependencies
    }],
    'jest/no-jasmine-globals': 0,
    'jest/valid-expect-in-promise': 0
  }
};

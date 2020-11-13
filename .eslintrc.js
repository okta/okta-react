// https://eslint.org/docs/user-guide/configuring

const packageJson = require('./package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:node/recommended-script',
    'plugin:jest/recommended'
  ],
  plugins: [
    'react',
    'react-hooks',
    'node',
    'jest'
  ],
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
  },
  overrides: [
    {
      // ES6/browser processed by Babel
      files: [
        'src/**/*',
        'test/jest/**/*',
        'test/e2e/harness/src/**/*',
        'test/e2e/harness/e2e/**/*',
        'rollup.config.js'
      ],
      parser: '@babel/eslint-parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      env: {
        browser: true,
        es6: true,
        node: false
      },
      rules: {
        'node/no-unsupported-features/es-syntax': 0,
        'node/no-unsupported-features/node-builtins': 0,
        'node/no-unpublished-import': ['error', {
          'allowModules': devDependencies
        }]
      }
    },
    {
      // Jest specs
      files: ['test/jest/**/*'],
      env: {
        jest: true
      },
      rules: {
        'node/no-unpublished-import': ['error', {
          'allowModules': devDependencies
        }]
      }
    },
    {
      // NodeJS build tools
      files: ['build.js', 'env.js', 'util/**/*'],
      rules: {
        'node/no-unpublished-require': ['error', {
          'allowModules': devDependencies
        }]    
      }
    }
  ]
};

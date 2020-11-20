// https://eslint.org/docs/user-guide/configuring

const packageJson = require('./package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  plugins: [
    'react',
    'react-hooks'
  ],
  rules: {
    'react/prop-types': 0,
  },
  settings: {
    react: {
      version: '16.8',
    }
  },
  overrides: [
    {
      // NodeJS build tools
      files: [
        'build.js', 
        'env.js', 
        'util/**/*', 
        'config-overrides.js',
        'protractor.conf.js',
        '.eslintrc.js',
        'babel.config.js',
        'jest.config.js'
      ],
      plugins: ['node'],
      env: {
        node: true,
        es6: true
      },
      rules: {
        'node/no-unpublished-require': ['error', {
          'allowModules': devDependencies
        }]    
      }
    },
    {
      // rollup.config.js
      files: ['rollup.config.js'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
      },
      env: {
        node: true
      }
    }
  ]
}

// https://eslint.org/docs/user-guide/configuring

const packageJson = require('./package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
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
        'jest.config.js',
        'vite.config.js',
        'bs-config.js'
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
    },
    {
      files: ['samples/**/*'],
      env: {
        node: true,
        browser: true
      }
    },
    {
      // SecureRoute/SecureOutlet must import the OktaContext object via the package's
      // own self-import so bundlers dedupe it to the same instance <Security> provides;
      // importing it from the relative path would give this file its own separate Context.
      files: ['src/SecureRoute.tsx', 'src/SecureOutlet.tsx'],
      rules: {
        'no-restricted-imports': ['error', {
          paths: [{
            name: './OktaContext',
            importNames: ['default'],
            message: "Import OktaContext from '@okta/okta-react' instead of './OktaContext' here - see the comment above this import."
          }]
        }]
      }
    }
  ]
}

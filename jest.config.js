require('./env'); // set variables in process.env

module.exports = {
  coverageDirectory: '<rootDir>/test-reports/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**',
    '!./test/**'
  ],
  globals: {
    AUTH_JS: { minSupportedVersion: '5.3.1' },
    SKIP_VERSION_CHECK: '1',
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  },
  reporters: [
    'default',
    'jest-junit'
  ],
  restoreMocks: true,
  moduleNameMapper: {
    '^@okta/okta-auth-js$': '<rootDir>/node_modules/@okta/okta-auth-js/dist/okta-auth-js.umd.js'
  },
  roots: [
    './test/jest'
  ],
  setupFiles: [
    './test/jest/setup.ts'
  ],
  testEnvironment: 'jsdom',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
};

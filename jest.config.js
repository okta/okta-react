require('./env'); // set variables in process.env

module.exports = {
  coverageDirectory: '<rootDir>/test-reports/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**',
    '!./test/**'
  ],
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
    './test/jest/setup.js'
  ],
  testEnvironment: 'jsdom'
};

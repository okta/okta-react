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
    PACKAGE_NAME: 'okta-react-test',
    PACKAGE_VERSION: '3.14.15',
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
    '^@okta/okta-auth-js$': '<rootDir>/node_modules/@okta/okta-auth-js/dist/okta-auth-js.umd.js',
    // avoid react conflict in yarn workspace
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-router-dom$': '<rootDir>/node_modules/react-router-dom'
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

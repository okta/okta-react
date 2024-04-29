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
    SKIP_VERSION_CHECK: '1'
  },
  reporters: [
    'default',
    'jest-junit'
  ],
  restoreMocks: true,
  moduleNameMapper: {
    // avoid react conflict in yarn workspace
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-router-dom$': '<rootDir>/node_modules/react-router-dom',
    '^@okta/okta-react$': '<rootDir>/src',
    '^@okta/okta-react/react-router-5$': '<rootDir>/src/react-router-5.ts',
    '^@okta/okta-react/react-router-6$': '<rootDir>/src/react-router-6.ts',
  },
  roots: [
    './test/jest'
  ],
  setupFiles: [
    './test/jest/setup.ts'
  ],
  testEnvironment: 'jsdom',
  transform: { 
    '^.+\\.tsx?$': ['ts-jest', {
      diagnostics: {
        warnOnly: true
      },
      tsconfig: '<rootDir>/test/jest/tsconfig.json',
      isolatedModules: true
    }] 
  },
};

/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = {
  coverageDirectory: '<rootDir>/test-reports/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**',
    '!src/.eslintrc.*'
  ],
  globals: {
    AUTH_JS: { minSupportedVersion: '5.3.1' },
    PACKAGE_NAME: 'okta-react-test',
    PACKAGE_VERSION: '3.14.15',
    SKIP_VERSION_CHECK: '1'
  },
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-reports/unit',
      outputName: 'junit-result.xml'
    }]
  ],
  restoreMocks: true,
  moduleNameMapper: {
    // avoid react conflict in yarn workspace
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-router-dom$': '<rootDir>/test/jest/node_modules/react-router-dom'
  },
  rootDir: '../..',
  testMatch: [
    '**/test/jest/*.test.*',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  setupFiles: [
    '<rootDir>/test/jest/setup.ts'
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

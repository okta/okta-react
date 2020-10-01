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
/* global browser, jasmine */
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const JUnitXmlReporter = require('jasmine-reporters').JUnitXmlReporter;
const TEST_RESULT_FILE_DIR = process.env.TEST_RESULT_FILE_DIR || '../../../test-reports/e2e';

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/*.test.js'
  ],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: ['headless', 'disable-gpu', 'window-size=1600x1200', 'no-sandbox']
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:8080/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    browser.ignoreSynchronization = true;
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));
    jasmine.getEnv().addReporter(new JUnitXmlReporter({
      savePath: TEST_RESULT_FILE_DIR,
      filePrefix: 'results',
    }));
  }
};

/*!
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
const jasmineReporters = require('jasmine-reporters');
const sampleConfigs = require('@okta/generator/config');
const env = require('@okta/env');
env.setEnvironmentVarsFromTestEnv();

function getProtractorConfig() {
  const sampleName = process.env.SAMPLE_NAME;
  if (!sampleName) {
    throw new Error('No SAMPLE_NAME was found, run tests with "yarn test" or add SAMPLE_NAME to the env vars.');
  }
  const sampleConfig = sampleConfigs.find(config => config.name === sampleName);
  if (!sampleConfig) {
    throw new Error(`Failed to find sample config with ${sampleName}`);
  }

  const config = {
    // Set the following env vars to match your test environment
    // Note the USERNAME should be of the form "username@email.com"
    params: {
      login: {
        // In windows, USERNAME is a built-in env var, which we don't want to change
        username: process.env.USER_NAME || process.env.USERNAME,
        password: process.env.PASSWORD,
        email: process.env.USER_NAME || process.env.USERNAME,
        email_mfa_username: process.env.EMAIL_MFA_USERNAME, // User with email auth MFA
      },
      // App servers start on port 8080 but configurable using env var
      appPort: process.env.PORT || 8080,
      appTimeOut: process.env.TIMEOUT || 1000
    },
    framework: 'jasmine2',
    onPrepare() {
      jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
        savePath: 'build2/reports/junit',
        filePrefix: 'results',
      }));
    },
    specs: sampleConfig.specs.map(spec => `specs/${spec}.js`),
    restartBrowserBetweenTests: false,
    capabilities: {
      browserName: 'chrome',
      chromeOptions: { 
        args: ['--headless', '--disable-gpu', '--window-size=800,600']
      }
    }
  };

  return config;
}

exports.config = getProtractorConfig();

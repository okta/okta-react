/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');
const path = require('path');
const samplesConfig = require('@okta/generator/config');

require('@okta/env').setEnvironmentVarsFromTestEnv();

const testName = process.env.SAMPLE_NAME;

function runNextTask(tasks) {
  if (tasks.length === 0) {
    console.log('all runs are complete');
    return;
  }
  const task = tasks.shift();
  task().then(() => {
    runNextTask(tasks);
  });
}

function runWithConfig(sampleConfig) {
  return new Promise((resolve) => {
    const { name } = sampleConfig;
    const port = sampleConfig.port || 8080;

    // 1. start the sample's web server
    const server = spawn('yarn', [
      'workspace',
      name,
      'start'
    ], { stdio: 'inherit' });

    waitOn({
      resources: [
        `http-get://localhost:${port}`
      ]
    }).then(() => {
      // 2. run webdriver based on if sauce is needed or not
      // TODO: support saucelab and cucumber
      const wdioConfig = path.resolve(__dirname, 'wdio.conf.js');
      const specs = sampleConfig.specs.reduce(
        (acc, spec) => [...acc, '--spec', path.join(__dirname, 'specs', spec)]
      , []);
      const args = ['wdio', 'run', wdioConfig, ...specs];
      const env = Object.assign({}, process.env, {APP_NAME: name});
      const runner = spawn('yarn', args, { stdio: 'inherit', env });

      let returnCode = 1;
      runner.on('exit', function (code) {
        console.log('Test runner exited with code: ', code);
        returnCode = code;
        server.kill();
      });
      runner.on('error', function (err) {
        server.kill();
        throw err;
      });
      server.on('exit', function(code) {
        console.log('Server exited with code: ', code);
        resolve(returnCode);
      });
    });
  })
}

function runHarnessTests () {
  const config = {
    name: '@okta/test.app.test-harness-app',
    specs: ['test-harness-app'],
    port: 8080
  }

  return runWithConfig(config);
}

if (testName) {
  console.log(`Running starting for test "${testName}"`);

  if (testName === 'harness') {
    runHarnessTests();
  }
  else {
    const sampleConfig = samplesConfig.find(config => config.name === testName);
    if (!samplesConfig) {
      throw new Error(`Failed to find sample config with ${testName} `);
    }
    console.log('Starting test with config: ', sampleConfig);
    runWithConfig(sampleConfig);
  }
} else {
  // Run all tests
  const tasks = samplesConfig.map((sampleConfig) => {
    const specs = sampleConfig.specs || [];
    if (!specs.length) {
      return;
    }
    // return taskFn.bind(null, sampleConfig);
    return runWithConfig.bind(null, sampleConfig);
  })
  .filter((task) => typeof task === 'function');

  runNextTask([runHarnessTests, ...tasks]);
}

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

/* eslint-disable */
const path = require('path');
const spawn = require('cross-spawn-with-kill');
const waitOn = require('wait-on');

// will load environment vars from testenv file and set on process.env
require('@okta/env').setEnvironmentVarsFromTestEnv(__dirname);

const ROUTER_APPS = [
  'reach-router',
  'react-router-dom-v5',
  'react-router-dom-v5-hash',
  'react-router-dom-v6',
  'react-router-dom-v6-hash',
];

const runTestsOnApp = (app) => {
  return new Promise((resolve) => {
    // extend `process.env` so variables like PATH are included
    const env = { ...(process.env), PORT: 8080 };
    // start react router app dev server
    const routerApp = spawn('yarn', ['workspace', `@okta/samples.react.${app}`, 'start'], { env });
    console.log(`## ~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ ##
  Running e2e tests on ${app}
## ~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ ##`
    );
    const stdErrHandler = data => console.error('FATAL ERROR: ', data.toString());
    routerApp.stderr.on('data', stdErrHandler);

    let returnCode = 0;
    routerApp.on('exit', function(code) {
      console.log('Server exited with code: ' + code);
      resolve(returnCode);
    });

    let routerAppError = null;
    routerApp.on('error', function (err) {
      console.log('error handler');
      console.log(err);
      routerAppError = err;
    });
    if (routerAppError) return routerApp.kill();

    // only listen for errors during initialization. `routerApp.kill` will end the process with an error code
    // un-binding listeners prevents false errors from being reported
    routerApp.stderr.off('data', stdErrHandler);
    waitOn({
      resources: [
        'http-get://localhost:8080'
      ],
      delay: 100,
      timeout: 10000
    })
    .then(() => {
      const wdioConfig = path.resolve(__dirname, 'wdio.conf.js');

      const runner = spawn('yarn', ['wdio', 'run', wdioConfig], { stdio: 'inherit' });

      runner.on('exit', function(code) {
        console.log('Test runner exited with code: ' + code);
        returnCode = code;
        routerApp.stderr.pause();
        routerApp.kill(code);
      });
      runner.on('error', function(err) {
        routerApp.kill();
        throw err;
      });
    })
    .catch(err => {
      console.error(err.message);
      routerApp.kill();
    });
  });
};

const runTests = async (apps) => {
  for (app of apps) {
    await runTestsOnApp(app);
    console.log(`${app} app test run complete!\n`);
  }
};

const appName = process.env.SAMPLE_APP;
if (appName) {
  if (!ROUTER_APPS.includes(appName)) {
    console.log(`Error: ${appName} not a valid router app`);
  }
  else {
    runTests([appName]).catch(console.error);
  }
}
else {
  runTests(ROUTER_APPS).catch(console.error);
}

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

const { series } = require('gulp');
const shell = require('shelljs');
const { install: installTask } = require('./common');
const { getVersions, getHygenCommand } = require('./util');

const versions = getVersions();

const generateTestHarness = () => {
  return new Promise((resolve, reject) => {
    const command = getHygenCommand(`yarn hygen test-harness new`, versions);
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  'generate:test-harness': series(generateTestHarness, installTask)
};

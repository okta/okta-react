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

const { series, parallel } = require('gulp');
const {
  getHygenActions, 
  buildHygenAction,
  getVersions,
} = require('./util');
const configs = require('../config');

const samplesConfig = (() => {
  const versions = getVersions();
  return configs.map(config => {
    const nameParts = config.name.split('.');
    const name = nameParts[nameParts.length - 1];
    const dest = `${config.nested || ''}${name}`;
    return {
      ...config, 
      ...versions, 
      name, 
      pkgName: config.name, 
      dest 
    };
  });
})();

const getCommonBuildTasks = () => {
  const actions = getHygenActions();
  const tasks = [];

  // add common build tasks
  samplesConfig
    .forEach(config => actions
      .forEach(action => tasks.push(
        buildHygenAction.bind(null, action, config)
      )));
  return tasks;
};

const generateSamplesTask = series(
  parallel(...getCommonBuildTasks())
);

module.exports = {
  'generate:samples': generateSamplesTask
};

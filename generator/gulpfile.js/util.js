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

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const getHygenCommand = (base, options) => {
  return Object.keys(options).reduce((acc, curr) => {
    acc += ` --${curr} "${options[curr]}"`;
    return acc;
  }, base);
};

const getHygenActions = () => {
  const dir = path.join(__dirname, '..', `_templates/samples`);
  return fs.readdirSync(dir).filter((file) => {
    return fs.statSync(dir + '/' + file).isDirectory();
  });
};

const getHygenAction = (actions, path) => {
  for (let action of actions) {
    if (path.includes(`/${action}`)) {
      return action;
    }
  }
  throw new Error('unknow path', path);
};

const buildHygenAction = (action, config) => {
  return new Promise((resolve, reject) => {
    if (config.excludeAction && config.excludeAction.test(action)) {
      resolve();
      return;
    }
    const command = getHygenCommand(`yarn hygen samples ${action}`, config || {});
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

const getPublishedModuleVersion = (module, cb) => {
  const stdout = shell.exec(`yarn info ${module} dist-tags --json`, { silent: true });
  const distTags = JSON.parse(stdout);
  const version = distTags.data.latest;
  console.log(`Last published ${module} version: `, version);
  cb && cb();
  return version;
};

const getVersions = () => {
  return {
    siwVersion: getPublishedModuleVersion('@okta/okta-signin-widget'),

    // only a single version of auth-js should exist in this repo (including all workspaces) to
    // guarantee all testing is done against a single version, especially during upstream artifact verification
    // the specific version of auth-js can be locked down when this sample is published to an independent samples repo
    // oktaAuthJsVersion: getPublishedModuleVersion(`@okta/okta-auth-js`),
    oktaAuthJsVersion: '*',

    // keep only one react version in this monorepo to get rid of multiple react versions issue
    // keep version under 17 to run unit tests
    reactVersion: '16.8.0' 
  };
};

const install = () => {
  shell.exec('yarn install --ignore-scripts');
};

module.exports = {
  getHygenCommand,
  getHygenActions,
  getHygenAction,
  buildHygenAction,
  getVersions,
  getPublishedModuleVersion,
  install,
};

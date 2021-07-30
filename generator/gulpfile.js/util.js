const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const samplesConfig = require('../config');

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

const install = () => {
  shell.exec('yarn install --ignore-scripts');
};

const buildEnv = options => {
  return new Promise((resolve, reject) => {
    const command = getHygenCommand(`yarn hygen env new`, options);
    shell.exec(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

const getSamplesConfig = () => {
  const versions = {
    siwVersion: getPublishedModuleVersion('@okta/okta-signin-widget'),
    oktaAuthJsVersion: getPublishedModuleVersion(`@okta/okta-auth-js`),
    // keep only one react version in this monorepo to get rid of multiple react versions issue
    // keep version under 17 to run unit tests
    reactVersion: '16.8.0' 
  };
  return samplesConfig.map(config => {
    const nameParts = config.name.split('.');
    const name = nameParts[nameParts.length - 1];
    const dest = `samples/${name}`;
    return { 
      ...config, 
      ...versions, 
      name, 
      pkgName: config.name, 
      dest 
    };
  });
};

module.exports = {
  getHygenCommand,
  getHygenActions,
  getHygenAction,
  buildHygenAction,
  buildEnv,
  getPublishedModuleVersion,
  install,
  getSamplesConfig
};

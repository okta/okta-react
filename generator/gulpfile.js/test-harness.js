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

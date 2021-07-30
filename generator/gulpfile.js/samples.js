const { series, parallel, watch } = require('gulp');
const shell = require('shelljs');
const { 
  clean: cleanTask,
  install: installTask
} = require('./common');
const {
  getHygenActions, 
  getHygenAction,
  getHygenCommand,
  buildHygenAction,
  getVersions,
} = require('./util');
const configs = require('../config');

const ACTION_OVERWRITE = 'overwrite';

const samplesConfig = (() => {
  const versions = getVersions();
  return configs.map(config => {
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
})();

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

const watchTask = () => {
  const actions = getHygenActions();
  const watcher = watch(`_templates/**/*`);
  watcher.on('all', (_, path) => {
    // handle env changes
    if (path.startsWith('_templates/env/new')) {
      samplesConfig.forEach(config => buildEnv(config));
      return
    }
    // get action from change path and execute build action
    const action = getHygenAction(actions, path);
    console.info(`\nFile ${path} has been changed, build start ... \n`);
    if (action === ACTION_OVERWRITE) {
      samplesConfig
        .filter(config => path.includes(config.name))
        .forEach(config => buildHygenAction(`${ACTION_OVERWRITE}:${config.name}`, config));
    } else {
      samplesConfig.forEach(config => buildHygenAction(action, config));
    }
    
    // check if yarn install is needed
    if (path.includes('package.json')) {
      console.info(`\n"package.json" has been changed, re-install packages ... \n`);
      install();
    }
  });
};

const getCommonBuildTasks = () => {
  const actions = getHygenActions();
  const tasks = [];
  // add build env tasks
  samplesConfig.forEach(config => {
    tasks.push(buildEnv.bind(null, config));
  });
  // add common build tasks
  samplesConfig
    .forEach(config => actions
      .filter(action => action !== ACTION_OVERWRITE)
      .forEach(action => tasks.push(
        buildHygenAction.bind(null, action, config)
      )));
  return tasks;
};

const getOverwriteBuildTasks = () => 
  samplesConfig.reduce((tasks, config) => {
    tasks.push(buildHygenAction.bind(null, `${ACTION_OVERWRITE}:${config.name}`, config));
    return tasks;
  }, []);


const generateSamplesTask = series(
  cleanTask,
  parallel(...getCommonBuildTasks()),
  parallel(...getOverwriteBuildTasks()),
  installTask
);

const devSamplesTask = series(
  generateSamplesTask,
  installTask, 
  watchTask
);

module.exports = {
  'generate:samples': generateSamplesTask,
  'dev:samples': devSamplesTask,
};

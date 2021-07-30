const { parallel, series, src, watch } = require('gulp');
const clean = require('gulp-clean');
const {
  install, 
  getHygenActions, 
  getHygenAction,
  buildEnv,
  buildHygenAction,
  getSamplesConfig
} = require('./util');

const BUILD_DIR = '../generated';
const ACTION_OVERWRITE = 'overwrite';

const samplesConfig = getSamplesConfig();

const cleanTask = () => 
  src(`${BUILD_DIR}`, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));

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

const installTask = done => {
  install();
  done();
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

const defaultTask = series(
  cleanTask,
  parallel(...getCommonBuildTasks()),
  parallel(...getOverwriteBuildTasks()),
  installTask
);

const devSamplesTask = series(
  defaultTask,
  installTask, 
  watchTask
)

module.exports = {
  default: defaultTask,
  'dev:samples': devSamplesTask,
  install: installTask,
  clean: cleanTask
};

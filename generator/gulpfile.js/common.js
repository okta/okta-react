const { src } = require('gulp');
const clean = require('gulp-clean');
const shell = require('shelljs');

const BUILD_DIR = '../generated';

const install = () => {
  shell.exec('yarn install --ignore-scripts');
};

const cleanTask = () => 
  src(`${BUILD_DIR}`, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));

const installTask = done => {
  install();
  done();
};

module.exports = {
  install: installTask,
  clean: cleanTask
};

const { series } = require('gulp');
const commonTasks = require('./common');
const samplesTasks = require('./samples');
const testHarnessTasks = require('./test-harness');

module.exports = {
  default: series(
    samplesTasks['generate:samples'], 
    testHarnessTasks['generate:test-harness']
  ),
  ...commonTasks,
  ...samplesTasks,
  ...testHarnessTasks,
};

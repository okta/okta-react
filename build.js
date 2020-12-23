'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');

const NPM_DIR = `dist`;
const BUNDLE_CMD = 'yarn bundle';
const BANNER_CMD = `yarn banners`;
const TSC_CMD = 'tsc';
const TYPES_DIR = `${NPM_DIR}/types`;
const SRC_DIR = `${NPM_DIR}/react-router`;

shell.echo(`Start building...`);

shell.rm(`-Rf`, `${NPM_DIR}/*`);

// Bundle with rollup
if (shell.exec(BUNDLE_CMD).code !== 0) {
  shell.echo(chalk.red(`Error: Rollup failed`));
  shell.exit(1);
}

// Compile ES6 modules
if (shell.exec(TSC_CMD).code !== 0) {
  shell.echo(chalk.red(`Error: Compiling ES6 modules failed`));
  shell.exit(1);
}
shell.cp(`-Rf`, `${TYPES_DIR}/*`, SRC_DIR);

// Maintain banners
if (shell.exec(BANNER_CMD).code !== 0) {
  shell.echo(chalk.red(`Error: Maintain banners failed`));
  shell.exit(1);
}

shell.echo(chalk.green(`Bundling completed`));

shell.cp(`-Rf`, [`package.json`, `LICENSE`, `*.md`], `${NPM_DIR}`);

shell.echo(`Modifying final package.json`);
let packageJSON = JSON.parse(fs.readFileSync(`./${NPM_DIR}/package.json`));
delete packageJSON.private; // remove private flag
delete packageJSON.scripts; // remove all scripts
delete packageJSON.jest; // remove jest section
delete packageJSON['jest-junit']; // remove jest-junit section
delete packageJSON.workspaces; // remove yarn workspace section

// Remove "build/" from the entrypoint paths.
['main', 'module', 'types'].forEach(function(key) {
  if (packageJSON[key]) { 
    packageJSON[key] = packageJSON[key].replace(`${NPM_DIR}/`, '');
  }
});

fs.writeFileSync(`./${NPM_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

shell.echo(chalk.green(`End building`));

'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');

const NPM_DIR = `dist`;
const BABEL_CMD = `babel src -d ${NPM_DIR}/src -s`;

shell.echo(`Start building...`);

shell.rm(`-Rf`, `${NPM_DIR}/*`);

// Transpile src using babel
if (shell.exec(BABEL_CMD).code !== 0) {
  shell.echo(chalk.red(`Error: Babel failed`));
  shell.exit(1);
}

shell.echo(chalk.green(`Babel completed`));

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

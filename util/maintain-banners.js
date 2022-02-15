const fs = require('fs');
const globby = require('globby');
const path = require('path');

const bannerSourcePath = path.join(__dirname, 'license-template.txt');
const filePatterns = [
  'src/**/*.{js,jsx,ts,tsx}',
  'test/**/*.{js,jsx,ts,tsx}',
  'generator/**/*.{js,jsx,ts,tsx}',
  'generated/**/*.{js,jsx,ts,tsx}',
  'dist/bundles/*.{js,jsx,ts,tsx}'
];
const files = globby.sync([path.join(__dirname, '..',`{${filePatterns.join(',')}}`), '!**/node_modules/**']);
const bannerSource = fs.readFileSync(bannerSourcePath).toString();
const copyrightRegex = /(Copyright \(c\) )([0-9]+)-?([0-9]+)?/;

files.forEach(file => {
  const contents = fs.readFileSync(file).toString();
  const match = contents.match(copyrightRegex);
  if (!match) {
    return fs.writeFileSync(file, bannerSource + '\n\n' + contents);
  }
});

const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Read information from package.json and expose as environment variables
const PACKAGE = require('./package.json');
process.env.PACKAGE_NAME = PACKAGE.name;
process.env.PACKAGE_VERSION = PACKAGE.version;

// Read environment variables from "testenv". Override environment vars if they are already set.
const TESTENV = path.resolve(__dirname, 'testenv');
if (fs.existsSync(TESTENV)) {
  const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });
}
process.env.CLIENT_ID = process.env.CLIENT_ID || process.env.SPA_CLIENT_ID;

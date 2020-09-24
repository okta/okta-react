/* global module, process */

const webpack = require('webpack');

require('../../../env'); // will load environment vars from testenv file and set on process.env

const env = {};
// List of environment variables made available to the app
[
  'ISSUER',
  'CLIENT_ID',
].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = JSON.stringify(process.env[key]);
});


module.exports = {
  /* eslint-disable no-param-reassign */
  webpack: (config) => {
    // Remove the 'ModuleScopePlugin' which keeps us from requiring outside the src/ dir
    config.resolve.plugins = [];

    // Define global vars from env vars (process.env has already been defined)
    config.plugins = [
      new webpack.DefinePlugin({
        'process.env': env,
      }),
    ].concat(config.plugins);

    config.devtool = 'source-map';
    config.module.rules.push(
        {
          test: /\.js$/,
          use: ["source-map-loader"],
          enforce: "pre"
        }
      );

    return config;
  },
};

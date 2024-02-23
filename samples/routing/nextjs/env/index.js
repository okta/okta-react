// "IMPORTANT: THIS FILE IS GENERATED, CHANGES SHOULD BE MADE WITHIN '@okta/generator'"

module.exports = () => {
  let oktaEnv;
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    oktaEnv = require('@okta/env');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      // try local env module
      oktaEnv = require('./okta-env');
      return oktaEnv;
    }

    throw err;
  }

  return oktaEnv;
};

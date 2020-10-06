#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service google-chrome-stable 83.0.4103.61-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/e2e"

export ISSUER=https://samples-javascript.okta.com/oauth2/default
export SPA_CLIENT_ID=0oapmwm72082GXal14x6
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD

if ! yarn test:e2e; then
  echo "e2e tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}

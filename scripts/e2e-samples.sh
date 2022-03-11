#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh "v14.18.0"

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export CI=true
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/e2e-samples"

export ISSUER=https://samples-javascript.okta.com/oauth2/default
export SPA_CLIENT_ID=0oapmwm72082GXal14x6
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD
export DEFAULT_TIMEOUT_INTERVAL=90000

if ! yarn test:e2e:samples; then
  echo "e2e-samples tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}

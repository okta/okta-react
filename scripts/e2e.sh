#!/bin/bash -x

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $DIR/utils/local.sh
source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 121.0.6167.85-1

export CI=true
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/e2e"
export E2E_LOG_DIR=/tmp/e2e-logs

export ISSUER=https://samples-javascript.okta.com/oauth2/default
export CLIENT_ID=0oapmwm72082GXal14x6
export SPA_CLIENT_ID=0oapmwm72082GXal14x6
export USERNAME=george@acme.com
get_terminus_secret "/" PASSWORD PASSWORD
export ORG_OIE_ENABLED=
export USE_CLASSIC_ENGINE=

# Point Bacon at the junit results before branching on the outcome. A failing run
# is exactly when the per-test detail is worth having, so these must not sit
# behind the success path.
echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}

if ! yarn test:e2e; then
  echo "e2e tests failed! Exiting..."
  log_extra_dir_as_zip ${E2E_LOG_DIR} "e2e-logs.zip"
  # publishes the results dir above and still fails the suite
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR}

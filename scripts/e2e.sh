#!/bin/bash -x

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $DIR/utils/local.sh
source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 106.0.5249.61-1

export CI=true
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/e2e"

export ISSUER=https://javascript-idx-sdk.okta.com
export CLIENT_ID=0oav2oxnlYjULp0Cy5d6
export SPA_CLIENT_ID=0oa17suj5x9khaVH75d7
export USERNAME=mary@acme.com
get_vault_secret_key repo_gh-okta-okta-auth-js/default password PASSWORD
export ORG_OIE_ENABLED=true
export USE_INTERACTION_CODE=true

if ! yarn test:e2e; then
  echo "e2e tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}

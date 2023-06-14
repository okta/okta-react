#!/bin/bash -x

# runs unit tests against latest 6.x version

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/unit"

if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Skipping unit tests against auth-js v6.x"
  exit ${SUCCESS}
fi

if ! yarn add -DW --ignore-scripts @okta/okta-auth-js@^6; then
  echo "auth-js v6.x could not be installed"
  exit ${FAILED_SETUP}
fi

# Run jest with "ci" flag
if ! yarn test:unit --ci; then
  echo "unit failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}

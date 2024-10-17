#!/bin/bash

# if not running on bacon
if [ -z "${TEST_SUITE_ID}" ]; then
  export OKTA_HOME=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/../.." &> /dev/null && pwd)
  export REPO="."
  export TEST_SUITE_TYPE_FILE=/dev/null
  export TEST_RESULT_FILE_DIR_FILE=/dev/null

  ### (known) Bacon exit codes
  # success
  export SUCCESS=0
  export PUBLISH_TYPE_AND_RESULT_DIR=0
  export PUBLISH_TYPE_AND_RESULT_DIR_BUT_SUCCEED_IF_NO_RESULTS=0
  # failure
  export FAILURE=1
  export FAILED_SETUP=1
  export TEST_FAILURE=1
  export PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL=1
  export PUBLISH_ARTIFACTORY_FAILURE=1

  # bacon commands
  setup_service () {
    echo 'noop'
  }

  get_secret () {
    # ensures the env var is set
    key="$2"
    if [ -z "${!key}" ]; then
      echo "$key is not defined. Exiting..."
      exit 1
    fi
  }

  get_terminus_secret () {
    # ensures the env var is set
    key="$3"
    if [ -z "${!key}" ]; then
      echo "$key is not defined. Exiting..."
      exit 1
    fi
  }

  get_vault_secret_key () {
    echo "'get_vault_secret_key' command has been deprecated!"
    exit 1
  }

  set -x  # when running locally, might as well see all the commands being ran
fi
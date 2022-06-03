#!/bin/bash -xe

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION="6.7.0-g140c85a"

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

# Install required node version
export NVM_DIR="/root/.nvm"
NODE_VERSION="${1:-v12.20.0}"
setup_service node $NODE_VERSION

cd ${OKTA_HOME}/${REPO}

# undo permissions change on scripts/publish.sh
git checkout -- scripts

# ensure we're in a branch on the correct sha
git checkout $BRANCH
git reset --hard $SHA

git config --global user.email "oktauploader@okta.com"
git config --global user.name "oktauploader-okta"

#!/bin/bash
YARN_REGISTRY=https://registry.yarnpkg.com
OKTA_REGISTRY=${ARTIFACTORY_URL}/api/npm/npm-okta-master

# Yarn does not utilize the npmrc/yarnrc registry configuration
# if a lockfile is present. This results in `yarn install` problems
# for private registries. Until yarn@2.0.0 is released, this is our current
# workaround.
#
# Related issues:
#  - https://github.com/yarnpkg/yarn/issues/5892
#  - https://github.com/yarnpkg/yarn/issues/3330

# Replace yarn registry with Okta's
echo "Replacing $YARN_REGISTRY with $OKTA_REGISTRY within yarn.lock files..."
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#" yarn.lock

# Install a specific version of auth-js, used by downstream artifact builds
if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"
  npm config set strict-ssl false

  if ! yarn add -DW --no-lockfile https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-auth-js/-/@okta/okta-auth-js-${AUTHJS_VERSION}.tgz ; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi

  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"
fi

# Install dependencies but do not build
if ! yarn install --frozen-lockfile; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Revert the original change(s)
echo "Replacing $OKTA_REGISTRY with $YARN_REGISTRY within yarn.lock files..."
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" yarn.lock

yarn why @okta/okta-auth-js

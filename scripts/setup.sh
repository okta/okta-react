#!/bin/bash -xe

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION=""

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

# Install required node version
export NVM_DIR="/root/.nvm"
NODE_VERSION="${1:-v14.18.3}"
setup_service node $NODE_VERSION
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

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

# Install dependencies but do not build
if ! yarn install --frozen-lockfile --ignore-scripts; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Revert the original change(s)
echo "Replacing $OKTA_REGISTRY with $YARN_REGISTRY within yarn.lock files..."
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" yarn.lock

# Install a specific version of auth-js, used by downstream artifact builds
if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Installing AUTHJS_VERSION: ${AUTHJS_VERSION}"
  npm config set strict-ssl false

  AUTHJS_URI=https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-auth-js/-/@okta/okta-auth-js-${AUTHJS_VERSION}.tgz
  if ! yarn add -DW --ignore-scripts ${AUTHJS_URI}; then
    echo "AUTHJS_VERSION could not be installed: ${AUTHJS_VERSION}"
    exit ${FAILED_SETUP}
  fi

  # modifies the package.json of all workspaces depending on @okta/okta-auth-js to point to the upstream version
  ./scripts/utils/sync-ws-auth-js.sh ${AUTHJS_URI}
  yarn --ignore-scripts

  npm config set strict-ssl true
  echo "AUTHJS_VERSION installed: ${AUTHJS_VERSION}"

  # verify single version of auth-js is installed
  # NOTE: okta-signin-widget will install it's own version of auth-js, filtered out
  AUTHJS_INSTALLS=$(find . -type d -path "*/node_modules/@okta/okta-auth-js" -not -path "*/okta-signin-widget/*" | wc -l)
  if [ $AUTHJS_INSTALLS -gt 1 ]
  then
    echo "ADDITIONAL AUTH JS INSTALL DETECTED"
    yarn why @okta/okta-auth-js
    exit ${FAILED_SETUP}
  fi
fi

# build auth-js
if ! yarn build; then
  echo "yarn build failed! Exiting..."
  exit ${FAILED_SETUP}
fi

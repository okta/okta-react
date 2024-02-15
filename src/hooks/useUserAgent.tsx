/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import * as React from 'react';
import { compare as compareVersions } from 'compare-versions';
import { AuthSdkError, OktaAuth } from '@okta/okta-auth-js';

declare const AUTH_JS: {
  minSupportedVersion: string;
}

declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;
declare const SKIP_VERSION_CHECK: string;

const addUserAgent = (oktaAuth: OktaAuth) => {
  if (oktaAuth?._oktaUserAgent) {
    const env = `${PACKAGE_NAME}/${PACKAGE_VERSION}`;
    if (oktaAuth._oktaUserAgent.environments?.indexOf?.(env) > -1) {
      // Already added
    } else {
      oktaAuth._oktaUserAgent.addEnvironment(env);
    }
  }
};

const checkAuthJsVersion = (oktaAuth: OktaAuth) => {
  let error: AuthSdkError | undefined;
  if (oktaAuth) {
    if (!oktaAuth._oktaUserAgent) {
      console.warn('_oktaUserAgent is not available on auth SDK instance. Please use okta-auth-js@^5.3.1 .');
    } else {
      // use SKIP_VERSION_CHECK flag to control version check in tests
      // OKTA-465157: remove SKIP_VERSION_CHECK
      const isAuthJsSupported = SKIP_VERSION_CHECK === '1' ||
        compareVersions(oktaAuth._oktaUserAgent.getVersion(), AUTH_JS.minSupportedVersion, '>=');
      if (!isAuthJsSupported) {
        error = new AuthSdkError(`
          Passed in oktaAuth is not compatible with the SDK,
          minimum supported okta-auth-js version is ${AUTH_JS.minSupportedVersion}.
        `);
      }
    }
  }
  return error;
};

// Add okta-react userAgent
const useUserAgent = (oktaAuth: OktaAuth): {
  versionError?: AuthSdkError 
} => {
  React.useEffect(() => {
    addUserAgent(oktaAuth);
  }, [oktaAuth]);

  const versionError = checkAuthJsVersion(oktaAuth);
  return { versionError };
};

export default useUserAgent;

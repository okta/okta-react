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
import { AuthSdkError, OktaAuth } from '@okta/okta-auth-js';

const LOGIN_CALLBACK_TIMEOUT = 1000;

const useLoginCallbackCheck = (
  oktaAuth: OktaAuth
): {
  loginCallbackError?: AuthSdkError
} => {
  const [loginCallbackError, setLoginCallbackError] = React.useState<AuthSdkError | undefined>(undefined);

  React.useEffect(() => {
    let loginCallbackTimer: NodeJS.Timeout;
    if (oktaAuth?.isLoginRedirect()) {
      loginCallbackTimer = setTimeout(() => {
        // Login redirect should be handled
        //  and `authStateManager.updateAuthState()` should be called anyway.
        // Otherwise `appState` in Security context will always be null
        //  and `useAuthRequired` hook would not work.
        // This can happen if LoginCallback component is attached to incorrect route.
        if (oktaAuth?.isLoginRedirect() && oktaAuth.authStateManager.getAuthState() === null) {
          setLoginCallbackError(new AuthSdkError('Login callback was not called on the login redirect apge. Please check your routes.'));
          // Force update auth state to prevent app stuck
          oktaAuth.authStateManager.updateAuthState();
        }
      }, LOGIN_CALLBACK_TIMEOUT);
    }
    return () => {
      clearTimeout(loginCallbackTimer);
      setLoginCallbackError(undefined);
    };
  }, [oktaAuth]);

  return { loginCallbackError };
};

export default useLoginCallbackCheck;

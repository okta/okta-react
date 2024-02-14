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
import {
  useOktaAuth,
  OnAuthRequiredFunction,
  SecurityComponents,
  ErrorComponent,
  LoadingElement,
} from './OktaContext';
import OktaError from './OktaError';
import { toRelativeUrl } from '@okta/okta-auth-js';

export interface AuthRequiredOptions extends SecurityComponents {
  onAuthRequired?: OnAuthRequiredFunction;
  requiresAuth?: boolean; // default: true
}

export interface AuthRequiredHook {
  isAuthenticated: boolean;
  loginError: Error | null;
  Error: ErrorComponent;
  Loading: LoadingElement | null;
}

const useAuthRequired = (
  options: AuthRequiredOptions = {}
): AuthRequiredHook => {
  const {
    onAuthRequired,
    requiresAuth,
    errorComponent,
    loadingElement,
  } = options;
  const pendingLogin = React.useRef(false);
  const [ loginError, setLoginError ] = React.useState<Error | null>(null);
  const {
    oktaAuth,
    authState,
    _onAuthRequired,
    errorComponent: defaultErrorComponent,
    loadingElement: defaultLoadingElement,
  } = useOktaAuth();

  const isAuthenticated = !!authState?.isAuthenticated;
  const Error = errorComponent ?? defaultErrorComponent ?? OktaError;
  const Loading = loadingElement ?? defaultLoadingElement ?? null;

  React.useEffect(() => {
    const handleLogin = async () => {
      if (pendingLogin.current) {
        return;
      }

      pendingLogin.current = true;

      const originalUri = toRelativeUrl(window.location.href, window.location.origin);
      oktaAuth.setOriginalUri(originalUri);
      const onAuthRequiredFn = onAuthRequired || _onAuthRequired;
      if (onAuthRequiredFn) {
        await onAuthRequiredFn(oktaAuth);
      } else {
        await oktaAuth.signInWithRedirect();
      }
    };

    if (requiresAuth === false) {
      // In `SecureRoute` (for react-router 5) we pass `requiresAuth: false`
      //  if route doesn't match current path
      return;
    }

    if (!authState) {
      // Auth state has not been loaded yet
      return;
    }

    if (authState.isAuthenticated) {
      pendingLogin.current = false;
      return;
    }

    // Start login if app has decided it is not logged in and there is no pending signin
    if (!authState.isAuthenticated) { 
      handleLogin().catch((err: Error) => {
        setLoginError(err);
      });
    }
  }, [
    authState,
    oktaAuth,
    _onAuthRequired,
    onAuthRequired,
    requiresAuth,
  ]);

  return {
    isAuthenticated,
    loginError,
    Error,
    Loading,
  };
};

export default useAuthRequired;

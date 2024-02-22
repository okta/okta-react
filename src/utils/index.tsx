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

import { toRelativeUrl, OktaAuth, AuthState } from '@okta/okta-auth-js';

export const getRelativeUri = (originalUri: string): string => {
  if (!originalUri) {
    return '/';
  }
  let uri = originalUri;
  if (uri.startsWith(window.location.origin)) {
    uri = toRelativeUrl(uri, window.location.origin);
  }
  if (uri.startsWith('/#')) {
    // strip the lead '/#' from the uri
    uri = uri.slice(2);
  }
  return uri;
};

export const waitForAuthenticated = (
  oktaAuth: OktaAuth
): Promise<boolean> => {
  return new Promise((resolve) => {
    const handleAuthStateChange = (authState: AuthState | null) => {
      if (authState?.isAuthenticated) {
        oktaAuth.authStateManager.unsubscribe(handleAuthStateChange);
        resolve(true);
      }
    };

    const authState = oktaAuth.authStateManager.getAuthState();
    oktaAuth.authStateManager.subscribe(handleAuthStateChange);
    handleAuthStateChange(authState);
  });
};

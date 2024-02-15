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
import { AuthState, OktaAuth } from '@okta/okta-auth-js';

const useAuthState = (oktaAuth: OktaAuth): AuthState | null => {
  const [authState, setAuthState] = React.useState(() => {
    if (!oktaAuth) {
      return null;
    }
    return oktaAuth.authStateManager.getAuthState();
  });

  React.useEffect(() => {
    if (!oktaAuth) {
      return;
    }

    // Update Security provider with latest authState
    const currentAuthState = oktaAuth.authStateManager.getAuthState();
    setAuthState(currentAuthState);
    const handler = (authState: AuthState) => {
      setAuthState(authState);
    };
    oktaAuth.authStateManager.subscribe(handler);

    // Trigger an initial change event to make sure authState is latest
    oktaAuth.start();

    return () => {
      oktaAuth.authStateManager.unsubscribe(handler);
    };
  }, [oktaAuth]);

  return authState;
};

export default useAuthState;

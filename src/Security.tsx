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
import { toRelativeUrl, AuthSdkError, OktaAuth } from '@okta/okta-auth-js';
import OktaContext, { OnAuthRequiredFunction, NavigateFunction } from './OktaContext';
import OktaError from './OktaError';

const Security: React.FC<{
  oktaAuth: OktaAuth, 
  onAuthRequired?: OnAuthRequiredFunction,
  navigate?: NavigateFunction,
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>> = ({ 
  oktaAuth, 
  onAuthRequired, 
  navigate,
  children 
}) => {
  const [authState, setAuthState] = React.useState(() => {
    if (!oktaAuth) {
      return { 
        isPending: true,
        isAuthenticated: false,
        idToken: null,
        accessToken: null,
      };
    }
    return oktaAuth.authStateManager.getAuthState();
  });

  React.useEffect(() => {
    if (!oktaAuth) {
      return;
    }

    // Add default restoreOriginalUri callback
    if (!oktaAuth.options.restoreOriginalUri) {
      oktaAuth.options.restoreOriginalUri = async (_, originalUri) => {
        const relativUrl = toRelativeUrl(originalUri, window.location.origin);
        if (navigate)
          navigate(relativUrl);
        else
          location.href = relativUrl;
      };
    }

    // Add okta-react userAgent
    oktaAuth.userAgent = `${process.env.PACKAGE_NAME}/${process.env.PACKAGE_VERSION} ${oktaAuth.userAgent}`;

    // Update Security provider with latest authState
    oktaAuth.authStateManager.subscribe((authState) => {
      setAuthState(authState);
    });

    // Trigger an initial change event to make sure authState is latest
    if (!oktaAuth.isLoginRedirect()) {
      oktaAuth.authStateManager.updateAuthState();
    }

    return () => oktaAuth.authStateManager.unsubscribe();
  }, [oktaAuth]);

  if (!oktaAuth) {
    const err = new AuthSdkError('No oktaAuth instance passed to Security Component.');
    return <OktaError error={err} />;
  }

  return (
    <OktaContext.Provider value={{ 
      oktaAuth, 
      authState, 
      _onAuthRequired: onAuthRequired,
      navigate
    }}>
      {children}
    </OktaContext.Provider>
  );
};

export default Security;

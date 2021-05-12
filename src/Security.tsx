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
import OktaContext, { OnAuthRequiredFunction, RestoreOriginalUriFunction } from './OktaContext';
import OktaError from './OktaError';

const Security: React.FC<{
  oktaAuth: OktaAuth,
  restoreOriginalUri: RestoreOriginalUriFunction, 
  onAuthRequired?: OnAuthRequiredFunction,
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>> = ({ 
  oktaAuth,
  restoreOriginalUri, 
  onAuthRequired, 
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
    if (!oktaAuth || !restoreOriginalUri) {
      return;
    }

    // Add default restoreOriginalUri callback
    if (oktaAuth.options.restoreOriginalUri && restoreOriginalUri) {
      console.warn('Two custom restoreOriginalUri callbacks are detected. The one from the OktaAuth configuration will be overridden by the provided restoreOriginalUri prop from the Security component.');
    }
    oktaAuth.options.restoreOriginalUri = async (oktaAuth: unknown, originalUri: string) => {
      restoreOriginalUri(oktaAuth as OktaAuth, originalUri);
    };

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
  }, [oktaAuth, restoreOriginalUri]);

  if (!oktaAuth) {
    const err = new AuthSdkError('No oktaAuth instance passed to Security Component.');
    return <OktaError error={err} />;
  }

  if (!restoreOriginalUri) {
    const err = new AuthSdkError('No restoreOriginalUri callback passed to Security Component.');
    return <OktaError error={err} />;
  }

  const oktaAuthMajorVersion = oktaAuth.userAgent?.split('/')[1]?.split('.')[0];
  if (oktaAuthMajorVersion 
      && oktaAuthMajorVersion !== process.env.AUTH_JS_MAJOR_VERSION 
      // skip in test as version and userAgent are dynamic
      && process.env.NODE_ENV !== 'test') {
    const err = new AuthSdkError(`
      Passed in oktaAuth is not compatible with the SDK,
      okta-auth-js version ${process.env.AUTH_JS_MAJOR_VERSION}.x is the current supported version.
    `);
    return <OktaError error={err} />;
  }

  return (
    <OktaContext.Provider value={{ 
      oktaAuth, 
      authState, 
      _onAuthRequired: onAuthRequired
    }}>
      {children}
    </OktaContext.Provider>
  );
};

export default Security;

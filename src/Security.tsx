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
import { AuthSdkError, AuthState, OktaAuth } from '@okta/okta-auth-js';
import OktaContext, { 
  OnAuthRequiredFunction, 
  RestoreOriginalUriFunction,
  AUTHSTATE_STATUS
} from './OktaContext';
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
      return null;
    }
    return oktaAuth.authStateManager.getAuthState();
  });
  const [oktaAuthMajorVersion] = React.useState(() => {
    if (!oktaAuth || !oktaAuth._oktaUserAgent) {
      return null;
    }

    const oktaAuthVersion = oktaAuth._oktaUserAgent.getVersion();
    const majorVersion = oktaAuthVersion?.split('.')[0];
    return majorVersion;
  });
  const [authStateStatus, setAuthStateStatus] = React.useState<AUTHSTATE_STATUS | null>(null);

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
    if (oktaAuth._oktaUserAgent) {
      oktaAuth._oktaUserAgent.addEnvironment(`${process.env.PACKAGE_NAME}/${process.env.PACKAGE_VERSION}`);
    } else {
      console.warn('_oktaUserAgent is not available on auth SDK instance. Please use okta-auth-js@^5.3.1 .');
    }

    // Update Security provider with latest authState
    const handler = (authState: AuthState) => {
      const newAuthStateStatus = authStateStatus === AUTHSTATE_STATUS.INITIALIZED ? AUTHSTATE_STATUS.UPDATED : AUTHSTATE_STATUS.INITIALIZED;
      setAuthStateStatus(newAuthStateStatus);
      setAuthState(authState);
    };
    oktaAuth.authStateManager.subscribe(handler);

    // Start services
    oktaAuth.start();

    return () => {
      oktaAuth.authStateManager.unsubscribe(handler);
      oktaAuth.stop();
    };
  }, [oktaAuth, restoreOriginalUri]);

  if (!oktaAuth) {
    const err = new AuthSdkError('No oktaAuth instance passed to Security Component.');
    return <OktaError error={err} />;
  }

  if (!restoreOriginalUri) {
    const err = new AuthSdkError('No restoreOriginalUri callback passed to Security Component.');
    return <OktaError error={err} />;
  }

  if (oktaAuthMajorVersion !== process.env.AUTH_JS_MAJOR_VERSION 
      // use SKIP_VERSION_CHECK flag to control version check in tests
      && process.env.SKIP_VERSION_CHECK !== '1') {
    const err = new AuthSdkError(`Passed in oktaAuth is not compatible with the SDK, okta-auth-js version ${process.env.AUTH_JS_MAJOR_VERSION}.x is the current supported version.`);
    return <OktaError error={err} />;
  }

  return (
    <OktaContext.Provider value={{ 
      oktaAuth, 
      authState, 
      _onAuthRequired: onAuthRequired,
      _authStateStatus: authStateStatus
    }}>
      {children}
    </OktaContext.Provider>
  );
};

export default Security;

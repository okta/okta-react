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
import OktaContext, {
  OnAuthRequiredFunction,
  RestoreOriginalUriFunction,
  SecurityComponents
} from './OktaContext';
import OktaError from '../components/OktaError';
import useAuthState from '../hooks/useAuthState';
import useUserAgent from '../hooks/useUserAgent';
import useRestoreOriginalUri from '../hooks/useRestoreOriginalUri';

export interface SecurityProps extends SecurityComponents {
  oktaAuth: OktaAuth;
  restoreOriginalUri: RestoreOriginalUriFunction;
  onAuthRequired?: OnAuthRequiredFunction;
}

const Security: React.FC<
  React.PropsWithChildren<SecurityProps>
  & React.HTMLAttributes<HTMLDivElement>
> = ({
  oktaAuth,
  restoreOriginalUri,
  onAuthRequired,
  errorComponent,
  loadingElement,
  children
}) => {
  const { versionError } = useUserAgent(oktaAuth);
  const authState = useAuthState(oktaAuth);
  useRestoreOriginalUri(oktaAuth, restoreOriginalUri);

  if (!oktaAuth) {
    const err = new AuthSdkError('No oktaAuth instance passed to Security Component.');
    return <OktaError error={err} />;
  }

  if (!restoreOriginalUri) {
    const err = new AuthSdkError('No restoreOriginalUri callback passed to Security Component.');
    return <OktaError error={err} />;
  }

  if (versionError) {
    return <OktaError error={versionError} />;
  }

  return (
    <OktaContext.Provider value={{ 
      oktaAuth, 
      authState, 
      _onAuthRequired: onAuthRequired,
      errorComponent,
      loadingElement,
    }}>
      {children}
    </OktaContext.Provider>
  );
};

export default Security;

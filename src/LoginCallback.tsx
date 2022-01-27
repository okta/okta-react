/*
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
import { useOktaAuth, OnAuthResumeFunction } from './OktaContext';
import OktaError from './OktaError';

interface LoginCallbackProps {
  errorComponent?: React.ComponentType<{ error: Error }>;
  onAuthResume?: OnAuthResumeFunction;
  loadingElement?: React.ReactElement;
}

const LoginCallback: React.FC<LoginCallbackProps> = ({ errorComponent, loadingElement = null, onAuthResume }) => { 
  const { oktaAuth, authState } = useOktaAuth();
  const [callbackError, setCallbackError] = React.useState(null);

  const ErrorReporter = errorComponent || OktaError;
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore OKTA-464505: backward compatibility support for auth-js@5
    const isInteractionRequired = oktaAuth.idx.isInteractionRequired || oktaAuth.isInteractionRequired;
    if (onAuthResume && isInteractionRequired()) {
      onAuthResume();
      return;
    }
    oktaAuth.handleLoginRedirect().then(() => {
      // In `<Security>` component service was not started in case of login redirect.
      // Start it now after `restoreOriginalUri` has been called and route changed.
      oktaAuth.start();
    }).catch(e => {
      setCallbackError(e);
    });
  }, [oktaAuth]);

  const authError = authState?.error;
  const displayError = callbackError || authError;
  if (displayError) { 
    return <ErrorReporter error={displayError}/>;
  }

  return loadingElement;
};

export default LoginCallback;

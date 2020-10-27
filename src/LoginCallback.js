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

import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { toRelativeUrl } from '@okta/okta-auth-js';
import { useOktaAuth } from './OktaContext';
import OktaError from './OktaError';

const LoginCallback = (props) => { 
  const history = useHistory();
  const { oktaAuth, authState, onPostLoginRedirect } = useOktaAuth();
  const authStateReady = !authState.isPending;

  let ErrorReporter = props.errorComponent || OktaError;

  useEffect(() => {
    const handleAuthentication = async () => {
      // Store tokens when redirect back from OKTA
      await oktaAuth.storeTokensFromRedirect();
      
      // Get and clear fromUri from storage
      const fromUri = oktaAuth.getFromUri();
      oktaAuth.removeFromUri();

      // Redirect to fromUri
      const onPostLoginRedirectFn = props.onPostLoginRedirect || onPostLoginRedirect;
      if (onPostLoginRedirectFn) {
        onPostLoginRedirectFn(fromUri);
      } else {
        history.replace(toRelativeUrl(fromUri, window.location.origin));
      }
    };

    handleAuthentication();
  }, [oktaAuth]);

  if(authStateReady && authState.error) { 
    return <ErrorReporter error={authState.error}/>;
  }

  return null;
};

export default LoginCallback;

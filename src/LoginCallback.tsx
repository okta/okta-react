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

const LoginCallback: React.FC<{ 
  errorComponent?: React.ComponentType<{ error: Error }>,
  onAuthResume?: OnAuthResumeFunction,
}> = ({ errorComponent, onAuthResume }) => { 
  const { oktaAuth, authState } = useOktaAuth();
  const authStateReady = !authState.isPending;
  const ErrorReporter = errorComponent || OktaError;

  React.useEffect(() => {

    if (onAuthResume && oktaAuth.isInteractionRequired?.() ) {
      onAuthResume();
      return;
    }
    oktaAuth.handleLoginRedirect()
    .catch( err => { 
      console.log(err); //TODO: handle these errors OKTA-361608
    });  

  }, [oktaAuth]);

  if(authStateReady && authState.error) { 
    return <ErrorReporter error={authState.error}/>;
  }

  return null;
};

export default LoginCallback;

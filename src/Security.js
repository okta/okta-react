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

import React, { useState, useEffect } from 'react';
import OktaContext from './OktaContext';

const Security = ({ oktaAuth, onAuthRequired, onPostLoginRedirect, children }) => { 
  if (!oktaAuth) {
    throw new Error('Missing required oktaAuth instance.');
  }

  const [authState, setAuthState] = useState(oktaAuth.authStateManager.getAuthState());

  useEffect(() => {
    oktaAuth.userAgent = `${process.env.PACKAGE_NAME}/${process.env.PACKAGE_VERSION} ${oktaAuth.userAgent}`;
    oktaAuth.authStateManager.subscribe((authState) => {
      setAuthState(authState);
    });

    if (!oktaAuth.token.isLoginRedirect()) {
      // Trigger an initial change event to make sure authState is latest
      oktaAuth.authStateManager.updateAuthState();
    }

    return () => oktaAuth.authStateManager.unsubscribe();
  }, [oktaAuth]);

  return (
    <OktaContext.Provider value={{ 
      oktaAuth, authState, onAuthRequired, onPostLoginRedirect
    }}>
      {children}
    </OktaContext.Provider>
  );
};

export default Security;

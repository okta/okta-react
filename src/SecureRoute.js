/*
 * Copyright (c) 2017-2020Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React, { useEffect, useRef } from 'react';
import { useOktaAuth } from './OktaContext';
import { Route, useRouteMatch } from 'react-router-dom';

const SecureRoute = ( props ) => { 
  const { oktaAuth, authState, _onAuthRequired } = useOktaAuth();
  const match = useRouteMatch(props);
  const pendingRef = useRef({
    handleLogin: false
  });

  useEffect(() => {
    const handleLogin = async () => {
      if (pendingRef.current.handleLogin) {
        return;
      }

      pendingRef.current.handleLogin = true;

      try {
        oktaAuth.setOriginalUri();
        const onAuthRequiredFn = props.onAuthRequired || _onAuthRequired;
        if (onAuthRequiredFn) {
          await onAuthRequiredFn(oktaAuth);
        } else {
          await oktaAuth.signInWithRedirect();
        }
      } finally {
        pendingRef.current.handleLogin = false;
      }
    };

    // Only process logic if the route matches
    if (!match) {
      return;
    }
    // Start login if and only if app has decided it is not logged inn
    if(!authState.isAuthenticated && !authState.isPending) { 
      handleLogin();
    }  
  }, [
    authState.isPending, 
    authState.isAuthenticated, 
    oktaAuth, 
    match, 
    props.onAuthRequired, 
    _onAuthRequired
  ]);

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Route
      { ...props }
    />
  );
};

export default SecureRoute;

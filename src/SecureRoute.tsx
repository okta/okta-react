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
import { useOktaAuth, OnAuthRequiredFunction, OnAuthExpiredFunction } from './OktaContext';
import { Route, useRouteMatch, RouteProps } from 'react-router-dom';
import { toRelativeUrl } from '@okta/okta-auth-js';

const SecureRoute: React.FC<{
  onAuthRequired?: OnAuthRequiredFunction;
  onAuthExpired?: OnAuthExpiredFunction;
} & RouteProps & React.HTMLAttributes<HTMLDivElement>> = ({ 
  onAuthRequired,
  onAuthExpired,
  ...routeProps 
}) => { 
  const { oktaAuth, authState, _onAuthRequired, _onAuthExpired } = useOktaAuth();
  const match = useRouteMatch(routeProps);
  const pendingLogin = React.useRef(false);
  const hasAuthenticated = React.useRef(false);

  React.useEffect(() => {
    const handleLogin = async () => {
      if (pendingLogin.current) {
        return;
      }

      // Save the current route before any redirection
      const originalUri = toRelativeUrl(window.location.href, window.location.origin);
      oktaAuth.setOriginalUri(originalUri);

      // We have previously signed in
      const hasExpired = hasAuthenticated.current === true;
      if (hasExpired) {
        const onAuthExpiredFn = onAuthExpired || _onAuthExpired;
        if (onAuthExpiredFn) {
          await onAuthExpiredFn(oktaAuth);
        } else {
          // There is no default behavior.
          // App should define an `onAuthExpired` handler to render some type of UI (for example a modal overlay) with a link to signin again.
        }
        return;
      }

      // First-time loading this route, do the auth flow
      pendingLogin.current = true;
      const onAuthRequiredFn = onAuthRequired || _onAuthRequired;
      if (onAuthRequiredFn) {
        await onAuthRequiredFn(oktaAuth);
      } else {
        await oktaAuth.signInWithRedirect();
      }
    };

    // Only process logic if the route matches
    if (!match) {
      return;
    }

    if (!authState) {
      return;
    }

    if (authState.isAuthenticated) {
      pendingLogin.current = false;
      hasAuthenticated.current = true;
      return;
    }

    // isAuthenticated is false
    handleLogin();

  }, [
    !!authState,
    authState ? authState.isAuthenticated : null, 
    oktaAuth, 
    match, 
    onAuthRequired, 
    _onAuthRequired,
    onAuthExpired,
    _onAuthExpired
  ]);

  // If the user has authenticated on this route (since component load), the component will be rendered.
  // It is possible that the app's tokens have expired or been removed since that point in time.
  // App should define an `onAuthExpired` handler to render some type of UI (for example a modal overlay) with a link to signin again.
  const shouldRender = (authState && authState.isAuthenticated) || hasAuthenticated.current;
  if (!shouldRender) {
    return null;
  }

  return (
    <Route
      { ...routeProps }
    />
  );
};

export default SecureRoute;

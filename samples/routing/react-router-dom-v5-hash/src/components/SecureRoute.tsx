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

import React from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { toRelativeUrl } from '@okta/okta-auth-js';
import { Route, RouteProps, useRouteMatch } from 'react-router-dom';
import Loading from './Loading';

export const SecureRoute: React.FC<{
  errorComponent?: React.ComponentType<{ error: Error }>;
} & RouteProps> = ({ errorComponent, ...routeProps }) => {
  const { oktaAuth, authState } = useOktaAuth();
  const match = useRouteMatch();
  const isPending = React.useRef(false);
  const [ error, setError ] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    const login = async () => {
      if (isPending.current) {
        return;
      }

      isPending.current = true;

      const originalUri = toRelativeUrl(window.location.href, window.location.origin);
      oktaAuth.setOriginalUri(originalUri);
      await oktaAuth.signInWithRedirect();
    };

     // Only process logic if the route matches
     if (!match) {
      return;
    }

    if (!authState) {
      return;
    }

    if (authState.isAuthenticated) {
      isPending.current = false;
      return;
    }

    if (!authState.isAuthenticated) { 
      login().catch(err => {
        setError(err);
      });
    }
  }, [authState, oktaAuth, match, isPending, setError]);

  if (error && errorComponent) {
    const ErrorComponent = errorComponent;
    return <ErrorComponent error={error} />
  }

  if (!authState || !authState?.isAuthenticated) {
    return (<Loading />);
  }

  return (
    <Route
      { ...routeProps }
    />
  );
};

export default SecureRoute;
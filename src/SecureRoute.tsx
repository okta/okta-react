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
import { useOktaAuth, OnAuthRequiredFunction } from './OktaContext';
import * as ReactRouterDom from 'react-router-dom';
import { toRelativeUrl, AuthSdkError } from '@okta/okta-auth-js';
// Important! Don't import OktaContext from './OktaContext'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import { OktaContext } from '@okta/okta-react';
import OktaError from './OktaError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let useMatch: any;
if ('useRouteMatch' in ReactRouterDom) {
  // trick static analyzer to avoid "'useRouteMatch' is not exported" error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMatch = (ReactRouterDom as any)['useRouteMatch' in ReactRouterDom ? 'useRouteMatch' : ''];
} else {
  // throw when useMatch is triggered
  useMatch = () => { 
    throw new AuthSdkError('Unsupported: SecureRoute only works with react-router-dom v5 or any router library with compatible APIs. See examples under the "samples" folder for how to implement your own custom SecureRoute Component.');
  };
}

const SecureRoute: React.FC<{
  onAuthRequired?: OnAuthRequiredFunction;
  errorComponent?: React.ComponentType<{ error: Error }>;
} & ReactRouterDom.RouteProps & React.HTMLAttributes<HTMLDivElement>> = ({ 
  onAuthRequired,
  errorComponent,
  ...routeProps
}) => {
  // Need to use OktaContext imported from `@okta/okta-react`
  // Because SecureRoute needs to be imported from `@okta/okta-react/react-router-5`
  const { oktaAuth, authState, _onAuthRequired } = useOktaAuth(OktaContext);
  const match = useMatch(routeProps);
  const pendingLogin = React.useRef(false);
  const [handleLoginError, setHandleLoginError] = React.useState<Error | null>(null);
  const ErrorReporter = errorComponent || OktaError;

  React.useEffect(() => {
    const handleLogin = async () => {
      if (pendingLogin.current) {
        return;
      }

      pendingLogin.current = true;

      const originalUri = toRelativeUrl(window.location.href, window.location.origin);
      oktaAuth.setOriginalUri(originalUri);
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
      return;
    }

    // Start login if app has decided it is not logged in and there is no pending signin
    if(!authState.isAuthenticated) { 
      handleLogin().catch(err => {
        setHandleLoginError(err as Error);
      });
    }  

  }, [
    authState,
    oktaAuth, 
    match, 
    onAuthRequired, 
    _onAuthRequired
  ]);

  if (handleLoginError) {
    return <ErrorReporter error={handleLoginError} />;
  }

  if (!authState || !authState.isAuthenticated) {
    return null;
  }

  return (
    <ReactRouterDom.Route
      { ...routeProps }
    />
  );
};

export default SecureRoute;

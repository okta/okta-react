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
import * as ReactRouterDom from 'react-router-dom';
import { AuthSdkError } from '@okta/okta-auth-js';
// Important! Don't import OktaContext from '../context'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import { OktaContext } from '@okta/okta-react';
import { AuthRequiredOptions } from '../hooks/useAuthRequired';
import getComponents, { ComponentsOptions } from '../utils/getComponents';
import { getRelativeUri } from '../utils';
import useOktaAuth from '../context/useOktaAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let useMatch: (props: ReactRouterDom.RouteProps) => boolean;
if ('useRouteMatch' in ReactRouterDom) {
  // trick static analyzer to avoid "'useRouteMatch' is not exported" error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMatch = (ReactRouterDom as any)['useRouteMatch' in ReactRouterDom ? 'useRouteMatch' : ''];
} else {
  // throw when useMatch is triggered
  useMatch = () => { 
    throw new AuthSdkError('Unsupported: SecureRoute only works with react-router-dom v5 or any router library with compatible APIs. Please use Route instead and wrap your component with AuthRequired.');
  };
}

export type SecureRouteProps = AuthRequiredOptions
  & ComponentsOptions
  & ReactRouterDom.RouteProps
  & React.HTMLAttributes<HTMLDivElement>;

const SecureRoute: React.FC<SecureRouteProps> = ({
  onAuthRequired,
  errorComponent,
  loadingElement,
  ...routeProps
}) => {
  // Need to use OktaContext imported from `@okta/okta-react`
  // Because SecureRoute needs to be imported from `@okta/okta-react/react-router-5`
  const oktaContext = useOktaAuth(OktaContext);
  const match = useMatch(routeProps);
  const pendingLogin = React.useRef(false);
  const [handleLoginError, setHandleLoginError] = React.useState<Error | null>(null);
  const {
    oktaAuth,
    authState,
    _onAuthRequired,
  } = oktaContext;
  const { ErrorReporter, Loading } = getComponents(oktaContext, {
    errorComponent, loadingElement,
  });

  React.useEffect(() => {
    const handleLogin = async () => {
      if (pendingLogin.current) {
        return;
      }

      pendingLogin.current = true;

      const originalUri = getRelativeUri(window.location.href);
      oktaAuth.setOriginalUri(originalUri);
      const onAuthRequiredFn = onAuthRequired || _onAuthRequired;
      if (onAuthRequiredFn) {
        await onAuthRequiredFn(oktaAuth);
      } else {
        await oktaAuth.signInWithRedirect();
      }
    };

    if (!match) {
      // Only process logic if the route matches.
      return;
    }

    if (!authState) {
      // Auth state has not been loaded yet
      return;
    }

    if (authState.isAuthenticated) {
      pendingLogin.current = false;
      return;
    }

    // Start login if app has decided it is not logged in and there is no pending signin
    if (!authState.isAuthenticated) { 
      handleLogin().catch((err: Error) => {
        setHandleLoginError(err);
      });
    }
  }, [
    authState,
    oktaAuth, 
    match, 
    onAuthRequired, 
    _onAuthRequired,
  ]);

  if (handleLoginError) {
    return <ErrorReporter error={handleLoginError} />
  } else if (!authState?.isAuthenticated) {
    return Loading;
  } else {
    return <ReactRouterDom.Route { ...routeProps } />;
  }
};

export default SecureRoute;

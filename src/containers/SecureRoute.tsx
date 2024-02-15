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
import useAuthRequired, { AuthRequiredOptions } from '../hooks/useAuthRequired';
import useComponents, { ComponentsOptions } from '../hooks/useComponents';
import { useOktaAuth } from '../context/OktaContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let useMatch: (props: ReactRouterDom.RouteProps) => boolean;
if ('useRouteMatch' in ReactRouterDom) {
  // trick static analyzer to avoid "'useRouteMatch' is not exported" error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMatch = (ReactRouterDom as any)['useRouteMatch' in ReactRouterDom ? 'useRouteMatch' : ''];
} else {
  // throw when useMatch is triggered
  useMatch = () => { 
    throw new AuthSdkError('Unsupported: <SecureRoute> only works with react-router-dom v5 or any router library with compatible APIs. Please use <Route> instead and wrap your component with <Secure>.');
  };
}

const SecureRoute: React.FC<
  AuthRequiredOptions
  & ComponentsOptions
  & ReactRouterDom.RouteProps
  & React.HTMLAttributes<HTMLDivElement>
> = ({
  onAuthRequired,
  errorComponent,
  loadingElement,
  ...routeProps
}) => {
  const match = useMatch(routeProps);
  const context = useOktaAuth();
  const { loginError, isAuthenticated } = useAuthRequired(context, {
    onAuthRequired,
    // Only process logic if the route matches.
    // Note that it's only needed if `<Switch>` is not used as parent for routes,
    //  otherwise it would not render unmatched routes.
    requiresAuth: !!match,
  });
  const { Error, Loading } = useComponents(context, {
    errorComponent, loadingElement,
  });

  if (!match) {
    return null;
  } else if (loginError) {
    return <Error error={loginError} />
  } else if (!isAuthenticated) {
    return Loading;
  } else {
    return <ReactRouterDom.Route { ...routeProps } />;
  }
};

export default SecureRoute;

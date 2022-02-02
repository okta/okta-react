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
import { RouteComponentProps } from '@reach/router';
import Loading from './Loading';


export type SecureRoutesChildProps = React.Component<RouteComponentProps>;

export type SecureRoutesProps = {
  children: React.ReactElement<SecureRoutesChildProps>;
  path: string;
  errorComponent?: React.ComponentType<{ error: Error }>;
} & RouteComponentProps;

export const SecureRoutes: React.FC<SecureRoutesProps> = ({ errorComponent, children }) => {
  const { oktaAuth, authState } = useOktaAuth();
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

    if (authState?.isAuthenticated) {
      isPending.current = false;
      return;
    }

    if (!authState || !authState.isAuthenticated) { 
      login().catch(err => {
        setError(err);
      });
    }
  }, [authState, oktaAuth, isPending, setError]);

  if (error && errorComponent) {
    const ErrorComponent = errorComponent;
    return <ErrorComponent error={error} />
  }

  if (!authState || !authState?.isAuthenticated) {
    return (<Loading />);
  }

  return (children);
};

export default SecureRoutes;
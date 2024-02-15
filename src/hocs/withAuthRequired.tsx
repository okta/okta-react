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

import * as React from 'react';
import { useOktaAuth } from '../context/OktaContext';
import useAuthRequired, { AuthRequiredOptions } from '../hooks/useAuthRequired';
import useComponents, { ComponentsOptions } from '../hooks/useComponents';

const withAuthRequired = <P extends Record<string, unknown>>(
  ComponentToWrap: React.ComponentType<P>,
  options: AuthRequiredOptions & ComponentsOptions = {}
): React.FC<P> => {
  const WrappedComponent = (props: P) => {
    const context = useOktaAuth();
    const { isAuthenticated, loginError } = useAuthRequired(context, options);
    const { Loading, Error } = useComponents(context, options);
    if (loginError) {
      return <Error error={loginError} />;
    } else if (!isAuthenticated) {
      return Loading;
    } else {
      return <ComponentToWrap {...props} />;
    }
  };

  const originalComponentName = ComponentToWrap.displayName || ComponentToWrap.name;
  const newComponentName = `withAuthRequired_${originalComponentName}`;
  WrappedComponent.displayName = newComponentName;
  return WrappedComponent;
};

export default withAuthRequired;

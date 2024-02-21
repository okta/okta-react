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
import useOktaAuth from '../context/useOktaAuth';
import useLoginCallback, { LoginCallbackOptions, LoginCallbackHook } from '../hooks/useLoginCallback';

const withLoginCalback = <P extends LoginCallbackHook>(
  ComponentToWrap: React.ComponentType<P>,
  options: LoginCallbackOptions = {}
): React.FC<Omit<P, keyof LoginCallbackHook>> => {
  const WrappedComponent = (props: Omit<P, keyof LoginCallbackHook>) => {
    const oktaContext = useOktaAuth();
    const loginCallbackProps = useLoginCallback(oktaContext, options);
    return (<ComponentToWrap
      {...loginCallbackProps}
      {...props as P}
    />);
  };

  const originalComponentName = ComponentToWrap.displayName || ComponentToWrap.name;
  const newComponentName = `withLoginCalback_${originalComponentName}`;
  WrappedComponent.displayName = newComponentName;
  return WrappedComponent;
};

export default withLoginCalback;

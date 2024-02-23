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
import useOktaAuth from '../context/useOktaAuth';
import useAuthRequired, { AuthRequiredOptions } from '../hooks/useAuthRequired';
import getComponents, { ComponentsOptions } from '../utils/getComponents';

export type AuthRequiredProps = React.PropsWithChildren<AuthRequiredOptions & ComponentsOptions>;

const AuthRequired: React.FC<AuthRequiredProps> = ({
  children,
  ...options
}) => {
  const oktaContext = useOktaAuth();
  const { isAuthenticated, loginError } = useAuthRequired(oktaContext, options);
  const { Loading, ErrorReporter } = getComponents(oktaContext, options);
  if (loginError) {
    return <ErrorReporter error={loginError} />;
  } else if (!isAuthenticated) {
    return Loading;
  } else {
    return <>{children}</>;
  }
};

export default AuthRequired;

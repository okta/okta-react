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
import { Switch, Route } from 'react-router-dom';
import { LoginCallback, loginCallbackHashRoutePath } from '@okta/okta-react';
import { SecureRoute } from '@okta/okta-react/react-router-5';

import config from '../config';
import Home from '../pages/Home';
import Protected from '../pages/Protected';

const useHashPathForLoginCalback = config.oidc.responseMode === 'fragment';
const HomeWithLoginCallback = () => {
  return (
    <LoginCallback strict>
      <Home />
    </LoginCallback>
  );
};

// NOTE:
//  * If using 'fragment' response mode (recommended for HashRouter), please use 
//    `loginCallbackHashRoutePath` to mount `LoginCallback` correctly
//    to paths like `/#/code=...&state=...`.
//  * If using 'query' response mode (NOT recommended for HashRouter), `LoginCallback` 
//    *must* be mounted on '/', as it matches the signIn redirect url.
//    Wrap `Home` with `LoginCallback` to render home page after login callback completed.
//  * Or as universal solution you can wrap `Home` component with `LoginCallback`
//    and then use `path='/'` without `exact`:
//    `<Route path='/' component={HomeWithLoginCallback} />`
//    It can handle login callback and then render child `Home` component.
const AppRoutes = () => {
  return (
    <Switch>
      <Route path='/home' component={Home} />
      <SecureRoute path='/protected' component={Protected} />
      {useHashPathForLoginCalback ? [
        <Route key='home' path='/' exact component={Home} />,
        <Route key='callback' path={loginCallbackHashRoutePath} component={LoginCallback} />
      ] : [
        <Route key='home' path='/' exact component={HomeWithLoginCallback} />
      ]}
    </Switch>
  );
};

export default AppRoutes;

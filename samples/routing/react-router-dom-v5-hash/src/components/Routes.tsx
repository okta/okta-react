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
import { LoginCallback } from '@okta/okta-react';
import { SecureRoute } from '@okta/okta-react/react-router-5';

import config from '../config';
import NotFound from '../pages/NotFound';
import Home from '../pages/Home';
import Protected from '../pages/Protected';

const useHashPathForLoginCalback = config.oidc.responseMode === 'fragment' || !config.oidc.pkce;

const NotFoundWithLoginCallback = (props: any) => (
  <LoginCallback>
    <NotFound {...props} />
  </LoginCallback>
);

const HomeWithLoginCallback = (props: any) => {
  return (
    <LoginCallback>
      <Home {...props} />
    </LoginCallback>
  );
};

// NOTE: 
// * If using `responseMode: 'fragment'` (or `pkce: false`) in OktaAuth config, 
//    <LoginCallback> *must* be mounted on '*' with a fallback to 404 component
// * If using 'query' response mode,
//    <LoginCallback> *must* be mounted on '/' with a fallback to home component
const AppRoutes = () => {
  return (
    <Switch>
      <Route path='/' exact component={useHashPathForLoginCalback ? Home : HomeWithLoginCallback} />
      <SecureRoute path='/protected' component={Protected} />
      <Route path='*' component={useHashPathForLoginCalback ? NotFoundWithLoginCallback : NotFound} />
    </Switch>
  );
};

export default AppRoutes;

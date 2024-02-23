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
import { Routes, Route, Outlet } from 'react-router-dom';
import { Secure, LoginCallback } from '@okta/okta-react';

import config from '../config';
import Home from '../pages/Home';
import Protected from '../pages/Protected';
import NotFound from '../pages/NotFound';

const usingFragmentForLoginCalback = config.oidc.responseMode === 'fragment' || !config.oidc.pkce;

const NotFoundWithLoginCallback = () => (
  <LoginCallback>
    <NotFound />
  </LoginCallback>
);

const HomeWithLoginCallback = () => {
  return (
    <LoginCallback>
      <Home />
    </LoginCallback>
  );
};

// NOTE: 
// * If using `responseMode: 'fragment'` (or `pkce: false`) in OktaAuth config, 
//    <LoginCallback> *must* be mounted on '*' with a fallback to 404 component
//   Because in this case a signin redirect URL is like 
//    'https://<your-host>/#id_token=...&access_token=...&token_type=Bearer&expires_in=3600&scope=...&state=...'
//    and HashRouter in react-router 6 is unable to find any route matching such location
//    except for "catch-all" route (<Route path="*">)
// * If using 'query' response mode,
//    <LoginCallback> *must* be mounted on '/' with a fallback to home component
//   Signin redirect URL in this case is 'https://<your-host>/?code=...&state=...'
const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={usingFragmentForLoginCalback ? <Home /> : <HomeWithLoginCallback />} />
      <Route path='/protected' element={<Secure><Outlet /></Secure>}>
        <Route path='' element={<Protected />} />
      </Route>
      <Route path='*' element={usingFragmentForLoginCalback ? <NotFoundWithLoginCallback /> : <NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

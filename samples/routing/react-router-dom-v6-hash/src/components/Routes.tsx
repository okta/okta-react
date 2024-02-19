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

const useHashPathForLoginCalback = config.oidc.responseMode === 'fragment';

const Fallback = () => (
  <LoginCallback>
    <NotFound />
  </LoginCallback>
);

const HomeWithLoginCallback = () => (
  <LoginCallback>
    <Home />
  </LoginCallback>
);


// NOTE: If using 'fragment' response mode (recommended for HashRouter), 
//  <LoginCallback> *must* be mounted on '*'
// Because signin redirect URL is 'https://<your host>/#code=...&state=...'
//  and HashRouter in react-router 6 is unable to find any route matching such location
//  except for root splat route (<Route path="*">)
//
// If using 'query' response mode (NOT recommended for HashRouter),
//  <LoginCallback> *must* be mounted on '/'
// Signin redirect URL in this case is 'https://<your host>/?code=...&state=...'
const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={useHashPathForLoginCalback ? <Home /> : <HomeWithLoginCallback />} />
      <Route path='/home' element={<Home />} />
      <Route path='/protected' element={<Secure><Outlet /></Secure>}>
        <Route path='' element={<Protected />} />
      </Route>
      <Route path='*' element={useHashPathForLoginCalback ? <Fallback /> : <NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

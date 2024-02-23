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
import { Outlet, RouteObject } from 'react-router-dom';
import { LoginCallback, AuthRequired } from '@okta/okta-react';

import SecureLayout from './components/SecureLayout';
import Home from './pages/Home';
import Protected from './pages/Protected';
import Profile, { profileLoader } from './pages/Profile';

const routes: RouteObject[] = [
  {
    path: '/',
    id: 'layout',
    element: <SecureLayout />,
    children: [
      {
        path: '',
        id: 'home',
        element: <Home />,
      },
      {
        path: 'login/callback',
        id: 'login-callback',
        element: <LoginCallback />,
      },
      {
        path: 'protected',
        id: 'protected-area',
        element: <AuthRequired><Outlet /></AuthRequired>,
        children: [
          {
            path: '',
            id: 'protected',
            element: <Protected />,
          },
          {
            path: 'profile',
            id: 'profile',
            element: <Profile />,
            loader: profileLoader,
          }
        ],
      },
    ],
  }
];

export default routes;

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
import { Outlet } from 'react-router-dom';
import { LoginCallback, Secure } from '@okta/okta-react';

import Root from './pages/Root';
import Home from './pages/Home';
import Protected from './pages/Protected';

const routes = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'login/callback',
        element: <LoginCallback />,
      },
      {
        path: 'protected',
        element: <Secure><Outlet /></Secure>,
        children: [
          {
            path: '',
            element: <Protected />,
          }
        ],
      },
    ],
  }
];

export default routes;

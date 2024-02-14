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
import { Router, RouteComponentProps } from '@reach/router';
import { LoginCallback, Secure } from '@okta/okta-react';

import Home from '../pages/Home';
import Protected from '../pages/Protected';
import Loading from './Loading';

const OktaLoginCallback: React.FC<RouteComponentProps> = () => (<LoginCallback loadingElement={<Loading />} />);

const AppRoutes = () => {
  return (
    <Router>
      <Home path='/' />
      <OktaLoginCallback path='login/callback' />
      <Secure path='protected' loadingElement={<Loading />}>
        <Protected path='/' />
      </Secure>
    </Router>
  );
};

export default AppRoutes;

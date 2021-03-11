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
import { Route, Switch, useHistory } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { Security, LoginCallback, SecureRoute } from '@okta/okta-react';
import Home from './Home';
import Protected from './Protected';
import CustomLogin from './CustomLogin';
import SessionTokenLogin from './SessionTokenLogin';

const App: React.FC<{ 
  oktaAuth: OktaAuth, 
  customLogin: boolean 
}> = ({ oktaAuth, customLogin }) => {
  const history = useHistory();

  const onAuthRequired = async () => {
    history.push('/login');
  };

  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
  };

  return (
    <React.StrictMode>
      <Security
        oktaAuth={oktaAuth}
        onAuthRequired={customLogin ? onAuthRequired : undefined}
        restoreOriginalUri={restoreOriginalUri}
      >
        <Switch>
          <Route path='/login' component={CustomLogin}/>
          <Route path='/sessionToken-login' component={SessionTokenLogin}/>
          <SecureRoute exact path='/protected' component={Protected}/>
          <Route path='/implicit/callback' component={LoginCallback} />
          <Route path='/pkce/callback' component={LoginCallback} />
          <Route path='/' component={Home}/>
        </Switch>
      </Security>
      <a href="/?pkce=1">PKCE Flow</a> | <a href="/">Implicit Flow</a>
    </React.StrictMode>
  );
};

export default App;

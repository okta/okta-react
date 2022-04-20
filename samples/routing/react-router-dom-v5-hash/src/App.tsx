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

import { useHistory } from 'react-router-dom';
import { Security } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';

import Footer from './components/Footer';
import Nav from './components/Nav';
import Routes from './components/Routes';


const oktaAuth = new OktaAuth({
  issuer: process.env.ISSUER,
  clientId: process.env.SPA_CLIENT_ID,
  redirectUri: window.location.origin + '/login/callback'
});

function App() {
  const history = useHistory();
  const restoreOriginalUri = (_oktaAuth: any,  originalUri: string) => {
    let uri = '/';
    if (originalUri) {
      // strip the lead '/#' from the uri
      uri = originalUri.startsWith('/#') ? originalUri.slice(2) : originalUri;
    }
    history.replace(toRelativeUrl(uri, window.location.origin));
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <div className="App">
        <header className="App-header">
          <Nav />
        </header>
        <main>
          <Routes />
        </main>
        <Footer />
      </div>
    </Security>
  );
}

export default App;

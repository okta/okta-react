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
import { Link } from 'react-router';
import { Credential } from '@okta/spa-platform';
import { orchestrator, signOutFlow } from './auth';

const Home: React.FC = () => {
  const [hasCredential, setHasCredential] = React.useState(false);

  React.useEffect(() => {
    Credential.getDefault().then((credential) => setHasCredential(credential !== null));
  }, []);

  const signIn = async () => {
    // Redirects to Okta - the returned promise never resolves because the page navigates away.
    await orchestrator.getToken();
  };

  const signOut = async () => {
    const credential = await Credential.getDefault();
    const idToken = credential?.token.idToken?.toString();
    if (!credential || !idToken) {
      return;
    }
    // Ending the Okta session redirect doesn't clear locally stored credentials - that's on the app.
    await credential.remove();
    const url = await signOutFlow.start(idToken);
    window.location.assign(url);
  };

  return (
    <div>
      <h1>okta-react client-js + React Router v8 sample</h1>
      {hasCredential ? (
        <button id="logout-button" onClick={signOut}>Sign out</button>
      ) : (
        <button id="login-button" onClick={signIn}>Sign in</button>
      )}
      <nav>
        <Link to="/protected">Protected</Link>
        {' | '}
        <Link to="/resource">Resource</Link>
      </nav>
    </div>
  );
};

export default Home;

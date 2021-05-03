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
import { AuthTransaction } from '@okta/okta-auth-js';
import { useOktaAuth } from '@okta/okta-react';

const SessionTokenLogin: React.FC = () => {
  const { oktaAuth } = useOktaAuth();
  const [sessionToken, setSessionToken] = React.useState<string | undefined>(undefined);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    oktaAuth.signInWithCredentials({
      username,
      password
    })
    .then((res: AuthTransaction) => {
      setSessionToken(res.sessionToken);
      oktaAuth.setOriginalUri('/');
      oktaAuth.token.getWithRedirect({sessionToken: res.sessionToken});
    })
    .catch((err: Error) => {
      console.log('Found an error', err);
    });
  };
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  if (sessionToken) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input id="username" type="text" value={username} onChange={handleUsernameChange} />
        Password:
        <input id="password" type="password" value={password} onChange={handlePasswordChange} />
      </label>
      <input id="submit" type="submit" value="Submit" />
    </form>
  );
};

export default SessionTokenLogin;

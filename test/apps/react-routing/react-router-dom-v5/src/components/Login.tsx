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
import { useOktaAuth } from '@okta/okta-react';

const Protected = () => {
  const { oktaAuth } = useOktaAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log(username, password);
    e.preventDefault();
    if (!username || !password) {
      return;
    }

    // TODO:
    oktaAuth.idx.authenticate({username, password})
    .then(resp => {
      console.log('resp: ', resp);
    })
    .catch(console.error);
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };


  return (
    <>
      <h1>Login</h1>
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input onChange={handleUsernameChange} value={username} />
          </div>
          <div>
            <label>Password</label>
            <input onChange={handlePasswordChange} value={password} />
          </div>
          <div>
            <button role="submit">Submit</button>
          </div>
        </form>
      </section>
    </>
  );
};

export default Protected;
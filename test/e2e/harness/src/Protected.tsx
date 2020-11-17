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

// implement with "withOktaAuth" HOC
import React, { useEffect, useState } from 'react';
import { OktaAuth } from '@okta/okta-auth-js';
import { withOktaAuth } from '@okta/okta-react';

const Protected: React.FC<{ oktaAuth: OktaAuth }> = ({ oktaAuth }) => {
  const [userInfo, setUserInfo] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const claims = await oktaAuth.getUser();
      const userinfo = JSON.stringify(claims, null, 4);
      setUserInfo(userinfo);
    };

    fetchUser();
  }, [oktaAuth]);

  const logout = async () => oktaAuth.signOut();

  return (
    <div>
      <div> Protected! </div>
      {userInfo && <pre id="userinfo-container"> {userInfo} </pre>}
      <button id="logout-button" onClick={logout}>Logout</button>
    </div>
  );
};

export default withOktaAuth(Protected);

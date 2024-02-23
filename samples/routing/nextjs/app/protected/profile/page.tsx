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

'use client'

import React from 'react';
import { UserClaims } from '@okta/okta-auth-js';
import { useOktaAuth } from '@okta/okta-react';


const UserClaimsComponent = ({
  userClaims
}: {
  userClaims: UserClaims
}) => {
  return (
    <>
      <table className="OktaUserClaims-table">
        <thead>
          <tr>
            <th>Claim</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(userClaims).map((claimEntry) => {
            const claimName = claimEntry[0];
            const claimValue = claimEntry[1];
            const claimId = `claim-${claimName}`;
            return (
              <tr key={claimName}>
                <td>{claimName}</td>
                <td id={claimId}>{claimValue.toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const Profile = () => {
  const [userClaims, setUserClaims] = React.useState<UserClaims>(null);
  const [error, setError] = React.useState<Error>(null);
  const [isLoading, setLoading] = React.useState<boolean>(true);
  const { oktaAuth } = useOktaAuth();

  React.useEffect(() => {
    oktaAuth.getUser().then((userClaims) => {
      setUserClaims(userClaims);
      setLoading(false);
    }).catch((err: Error) => {
      setLoading(false);
      setError(err);
    });
  }, [ oktaAuth ]);

  if (isLoading) {
    return (<p>Loading user claims...</p>);
  }
  if (error) {
    return (
      <p>{error.name}: {error.message}</p>
    );
  }
  return (
    <UserClaimsComponent userClaims={userClaims} />
  );
};

const ProfilePage = () => {
  return (
    <>
      <h1 className='page-header'>Profile</h1>
      <Profile />
    </>
  );
};

export default ProfilePage;

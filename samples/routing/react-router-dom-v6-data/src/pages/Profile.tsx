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
import { UserClaims } from '@okta/okta-auth-js';
import { waitForAuthenticated } from '@okta/okta-react';
import { useLoaderData, Await, LoaderFunction } from 'react-router-dom';

import oktaAuth from '../auth/oktaAuth';
import Loading from '../components/Loading';

export interface ProfileLoaderData {
  userClaims: UserClaims;
}

export const profileLoader: LoaderFunction = () => {
  // Important!
  // Do NOT return `waitForAuthenticated` promise in `loader` function.
  // react-router 6 blocks rendering of all route elements until matching loaders are resolved.
  // This means that <Security> component would not be rendered and OktaAuth would not start.
  // Without rendering <Security> component `waitForAuthenticated` would NOT be resolved!
  return ({
    userClaims: waitForAuthenticated(oktaAuth).then(() => oktaAuth.getUser())
  });
};

const ResolvedProfile = ({
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
  const { userClaims } = useLoaderData() as ProfileLoaderData;
  return (
    <>
      <h1 className='page-header'>Profile</h1>
      <React.Suspense fallback={<Loading />}>
        <Await
          resolve={userClaims}
          children={(userClaims) => (
            <ResolvedProfile userClaims={userClaims} />
          )}
        />
      </React.Suspense>
    </>
  );
};

export default Profile;

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
import { Link, useLoaderData } from 'react-router';

const Resource: React.FC = () => {
  const userInfo = useLoaderData();

  return (
    <div>
      <h1>Resource</h1>
      <p>Loaded via <code>createFetchLoader</code> (<code>/oauth2/v1/userinfo</code>).</p>
      <pre id="userinfo">{JSON.stringify(userInfo, null, 2)}</pre>
      <Link to="/">Home</Link>
    </div>
  );
};

export default Resource;

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
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Credential } from '@okta/spa-platform';
import { router } from './router';

if (import.meta.env.DEV) {
  // Exposed for manual testing from the browser console, e.g.:
  //   const cred = await __auth.Credential.getDefault();
  //   await cred.revoke();   // invalidates the access token server-side
  //   await cred.refresh();  // forces a refresh attempt (throws: no refresh token in this app's scopes)
  (window as unknown as { __auth: unknown }).__auth = { Credential };
}

const container = document.getElementById('root');

createRoot(container!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

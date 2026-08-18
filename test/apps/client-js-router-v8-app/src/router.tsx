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

import { createBrowserRouter } from 'react-router';
import { createFetchLoader, createLoadersFromOrchestrator } from '@okta/okta-react/client-js';
import { orchestrator, fetchClient } from './auth';
import Home from './Home';
import Protected from './Protected';
import Resource from './Resource';
import LoginCallback from './LoginCallback';
import ErrorBoundary from './ErrorBoundary';

const fetchResource = createFetchLoader(fetchClient);
const { tokenLoader, loginCallbackLoader } = createLoadersFromOrchestrator(orchestrator);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/protected',
    element: <Protected />,
    loader: () => tokenLoader(),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/resource',
    element: <Resource />,
    loader: () => fetchResource('/resource.json'),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/login/callback',
    element: <LoginCallback />,
    loader: loginCallbackLoader,
    errorElement: <ErrorBoundary />,
  },
]);

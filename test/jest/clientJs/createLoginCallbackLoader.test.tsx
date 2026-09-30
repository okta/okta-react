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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom-v6';
import { createLoginCallbackLoader } from '../../../src/client-js/createLoginCallbackLoader';

describe('createLoginCallbackLoader', () => {
  it('resumes the flow via orchestrator.resumeFlow() and redirects to originalUri', async () => {
    const orchestrator = {
      resumeFlow: jest.fn().mockResolvedValue({ tags: ['main'], originalUri: '/protected' }),
    };

    const router = createMemoryRouter(
      [
        { path: '/login/callback', loader: createLoginCallbackLoader(orchestrator as any) },
        { path: '/protected', element: <p>protected page</p> },
      ],
      { initialEntries: ['/login/callback?code=abc&state=xyz'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByText('protected page')).toBeInTheDocument());
    expect(orchestrator.resumeFlow).toHaveBeenCalledWith(expect.stringContaining('/login/callback?code=abc&state=xyz'));
  });

  it('redirects to "/" when the resumed context has no originalUri', async () => {
    const orchestrator = {
      resumeFlow: jest.fn().mockResolvedValue({}),
    };

    const router = createMemoryRouter(
      [
        { path: '/login/callback', loader: createLoginCallbackLoader(orchestrator as any) },
        { path: '/', element: <p>home page</p> },
      ],
      { initialEntries: ['/login/callback?code=abc&state=xyz'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByText('home page')).toBeInTheDocument());
  });
});

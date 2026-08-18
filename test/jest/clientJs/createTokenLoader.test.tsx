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
import { createMemoryRouter, RouterProvider, useLoaderData, useRouteError, isRouteErrorResponse } from 'react-router-dom-v6';
import { createTokenLoader } from '../../../src/client-js/createTokenLoader';

describe('createTokenLoader', () => {
  it('resolves the token via orchestrator.getToken()', async () => {
    const token = { accessToken: 'abc123' };
    const orchestrator = { getToken: jest.fn().mockResolvedValue(token) };
    const getToken = createTokenLoader(orchestrator as any);

    function Page() {
      const data = useLoaderData() as typeof token;
      return <p>{data.accessToken}</p>;
    }

    const router = createMemoryRouter(
      [{ path: '/', element: <Page />, loader: () => getToken() }],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByText('abc123')).toBeInTheDocument());
    expect(orchestrator.getToken).toHaveBeenCalledWith(undefined);
  });

  it('passes the provided params through to orchestrator.getToken()', async () => {
    const orchestrator = { getToken: jest.fn().mockResolvedValue({ accessToken: 'xyz' }) };
    const getToken = createTokenLoader(orchestrator as any);
    const params = { scopes: ['openid'] };

    function Page() {
      useLoaderData();
      return <p>done</p>;
    }

    const router = createMemoryRouter(
      [{ path: '/', element: <Page />, loader: () => getToken(params) }],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByText('done')).toBeInTheDocument());
    expect(orchestrator.getToken).toHaveBeenCalledWith(params);
  });

  it('throws a 401 Response when getToken() resolves null', async () => {
    const orchestrator = { getToken: jest.fn().mockResolvedValue(null) };
    const getToken = createTokenLoader(orchestrator as any);

    function ErrorBoundary() {
      const error = useRouteError();
      return <p>{isRouteErrorResponse(error) ? error.status : 'unknown'}</p>;
    }

    const router = createMemoryRouter(
      [{
        path: '/',
        element: <p>never rendered</p>,
        loader: () => getToken(),
        errorElement: <ErrorBoundary />,
      }],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByText('401')).toBeInTheDocument());
  });
});

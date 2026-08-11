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
import { createMemoryRouter, RouterProvider, useLoaderData } from 'react-router-dom-v6';
import { createFetchLoader } from '../../../src/client-js/createFetchLoader';

describe('createFetchLoader', () => {
  it('fetches the resource via fetchClient.fetch() and exposes the parsed Response through useLoaderData', async () => {
    const fetchClient = {
      fetch: jest.fn().mockResolvedValue(new Response(JSON.stringify({ id: '123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })),
    };

    function Page() {
      const data = useLoaderData() as { id: string };
      return <p>{data.id}</p>;
    }

    const router = createMemoryRouter(
      [{
        path: '/',
        element: <Page />,
        loader: createFetchLoader(fetchClient as any, () => '/api/resource'),
      }],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByText('123')).toBeInTheDocument());
    expect(fetchClient.fetch).toHaveBeenCalledWith('/api/resource', undefined);
  });

  it('derives the resource from request/params and forwards init through to fetchClient.fetch()', async () => {
    const fetchClient = {
      fetch: jest.fn().mockResolvedValue(new Response(null, { status: 204 })),
    };
    const getResource = jest.fn(({ params }: any) => `/api/users/${params.userId}`);
    const init = { headers: { 'X-Test': '1' } };

    function Page() {
      useLoaderData();
      return <p>done</p>;
    }

    const router = createMemoryRouter(
      [{
        path: '/users/:userId',
        element: <Page />,
        loader: createFetchLoader(fetchClient as any, getResource, init),
      }],
      { initialEntries: ['/users/abc'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByText('done')).toBeInTheDocument());
    expect(getResource).toHaveBeenCalledWith(
      expect.objectContaining({ params: expect.objectContaining({ userId: 'abc' }) })
    );
    expect(fetchClient.fetch).toHaveBeenCalledWith('/api/users/abc', init);
  });
});

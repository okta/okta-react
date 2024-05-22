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

import { RouterProvider, createBrowserRouter, Outlet, redirect, LoaderFunctionArgs } from 'react-router-dom';
import authProvider from './auth';

import Footer from './components/Footer';
import Nav from './components/Nav';
import Loading from './components/Loading';

import Home from './pages/Home';
import Protected from './pages/Protected';

const protectedLoader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authProvider.getUser();
  if (!user) {
    await authProvider.signin(new URL(request.url).pathname);
    return new Error('foo');
  }
  return user;
}

const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    async loader () {
      const user = await authProvider.getUser();
      return user;
    },
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home
      },
      {
        // must be public route
        path: 'login/callback',
        async loader () {
          const uri = await authProvider.handleAuthCodeCallback();
          return redirect(uri ?? '/');
        },
        Component: Home
      },
      {
        path: 'protected',
        loader: protectedLoader,
        // TODO: provide access token to sequent loader call
        Component: Protected
      }
    ]
  }
]);

function Layout() {
  return (
    <div className="App">
      <header className="App-header">
        <Nav />
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App () {
  return (
    <RouterProvider router={router} fallbackElement={<Loading />} />
  );
}

export default App;

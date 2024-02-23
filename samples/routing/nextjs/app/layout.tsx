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

import { Security, getRelativeUri } from '@okta/okta-react';
import { OktaAuth } from '@okta/okta-auth-js';
import { useRouter } from 'next/navigation';
import config from './config';
import './index.css'

import Footer from './components/Footer';
import Nav from './components/Nav';
import Loading from './components/Loading';

const oktaAuth = new OktaAuth(config.oidc);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const restoreOriginalUri = React.useCallback((_oktaAuth: OktaAuth,  originalUri: string) => {
    router.replace(getRelativeUri(originalUri));
  }, [router]);

  return (
    <html lang="en">
      <body>
        <Security
          oktaAuth={oktaAuth}
          restoreOriginalUri={restoreOriginalUri}
          loadingElement={<Loading />}
        >
          <div className="App">
            <header className="App-header">
              <Nav />
            </header>
            <main>
              {children}
            </main>
            <Footer />
          </div>
        </Security>
      </body>
    </html>
  )
}

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
import { OktaAuth } from '@okta/okta-auth-js';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

const { ISSUER, CLIENT_ID } = process.env;

// To perform end-to-end PKCE flow we must be configured on both ends: when the login is initiated, and on the callback
// The login page is loaded with a query param. This will select a unique callback url
// On the callback load we detect PKCE by inspecting the pathname
const url = new URL(window.location.href);
const pkce = !!url.searchParams.get('pkce') || url.pathname.indexOf('pkce/callback') >= 0;
const redirectUri = window.location.origin + (pkce ? '/pkce/callback' : '/implicit/callback');
const customLogin = !!url.searchParams.get('customLogin');
const baseUrl =  ISSUER?.split('/oauth2')[0] || 'ISSUER-NOT-SUPPLIED';

const oktaAuth = new OktaAuth({
  issuer: ISSUER as string,
  clientId: CLIENT_ID,
  redirectUri,
  pkce
});

const container = document.getElementById('root')

createRoot(container!).render(
  <Router>
    <App oktaAuth={oktaAuth} customLogin={customLogin} baseUrl={baseUrl} />
  </Router>
);

/*
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const origin = typeof window !== 'undefined' ? window.location.origin : '';

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '{clientId}';
const ISSUER = process.env.NEXT_PUBLIC_ISSUER || 'https://{yourOktaDomain}.com/oauth2/default';
const OKTA_TESTING_DISABLEHTTPSCHECK = process.env.NEXT_PUBLIC_OKTA_TESTING_DISABLEHTTPSCHECK || false;
const BASENAME = process.env.NEXT_PUBLIC_PUBLIC_URL || '';
const REDIRECT_URI = `${origin}${BASENAME}/login/callback`;

export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
  }
};

/*!
 * Copyright (c) 2015-2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';


import LoginHomePage from '../page-objects/shared/login-home-page';
import DirectAuthLoginInPage from '../page-objects/direct-auth-login-form';
import AuthenticatedHomePage from '../page-objects/shared/authenticated-home-page';
import ProtectedPage from '../page-objects/shared/protected-page';
import url from 'url';

const params = {
  login: {
    // In windows, USERNAME is a built-in env var, which we don't want to change
    username: process.env.USER_NAME || process.env.USERNAME,
    password: process.env.PASSWORD,
    email: process.env.USER_NAME || process.env.USERNAME,
    email_mfa_username: process.env.EMAIL_MFA_USERNAME, // User with email auth MFA
  },
  // App servers start on port 8080 but configurable using env var
  appPort: process.env.PORT || 8080,
  appTimeOut: process.env.TIMEOUT || 1000
};

describe('Doc Direct Auth Flow', () => {
  const appRoot = `http://localhost:${params.appPort}`;

  beforeEach(async () => {
    if (!process.env.CODE_WAIT_TIME) {
      console.log('Setting default wait time for code to 5 seconds')
      process.env.CODE_WAIT_TIME = 5000;
    }

    await browser.url(appRoot);
  });

  it('can login with user credentials', async () => {
    await LoginHomePage.waitForPageLoad();

    await LoginHomePage.clickLoginButton();
    await DirectAuthLoginInPage.waitForPageLoad();

    // Verify that current domain hasn't changed to okta-hosted login, rather a local custom login page
    const urlProperties = url.parse(process.env.ISSUER);
    expect(browser).not.toHaveUrlContaining(urlProperties.host);
    expect(browser).toHaveUrlContaining(appRoot);

    await DirectAuthLoginInPage.login(params.login.username, params.login.password);
    await AuthenticatedHomePage.waitForProtectedButton();

    // can access protected page
    await AuthenticatedHomePage.viewProtectedPage();
    await ProtectedPage.waitForPageLoad();
  });

  it('can log the user out', async () => {
    await AuthenticatedHomePage.waitForPageLoad();
    await AuthenticatedHomePage.logout();
    await LoginHomePage.waitForPageLoad();
  });
});

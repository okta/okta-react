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

const LoginHomePage = require('../page-objects/shared/login-home-page');
const DirectAuthLoginInPage = require('../page-objects/direct-auth-login-form');
const AuthenticatedHomePage = require('../page-objects/shared/authenticated-home-page');
const ProtectedPage = require('../page-objects/shared/protected-page');
const url = require('url');

describe('Doc Direct Auth Flow', () => {
  const loginHomePage = new LoginHomePage();
  const diectAuthLoginForm = new DirectAuthLoginInPage();
  const authenticatedHomePage = new AuthenticatedHomePage();
  const protectedPage = new ProtectedPage();
  const appRoot = `http://localhost:${browser.params.appPort}`;

  beforeEach(() => {
    browser.ignoreSynchronization = true;
    if (process.env.DEFAULT_TIMEOUT_INTERVAL) {
      console.log(`Setting default timeout interval to ${process.env.DEFAULT_TIMEOUT_INTERVAL}`)
      jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.DEFAULT_TIMEOUT_INTERVAL;
    }

    if (!process.env.CODE_WAIT_TIME) {
      console.log('Setting default wait time for code to 5 seconds')
      process.env.CODE_WAIT_TIME = 5000;
    }

    browser.get(appRoot);
  });

  afterAll(() => {
    return browser.driver.close().then(() => {
      browser.driver.quit();
    });
  });

  it('can login with user credentials', () => {
    loginHomePage.waitForPageLoad();

    loginHomePage.clickLoginButton();
    diectAuthLoginForm.waitForPageLoad();

    // Verify that current domain hasn't changed to okta-hosted login, rather a local custom login page
    const urlProperties = url.parse(process.env.ISSUER);
    expect(browser.getCurrentUrl()).not.toContain(urlProperties.host);
    expect(browser.getCurrentUrl()).toContain(appRoot);

    diectAuthLoginForm.login(browser.params.login.username, browser.params.login.password);
    authenticatedHomePage.waitForProtectedButton();

    // can access protected page
    authenticatedHomePage.viewProtectedPage();
    protectedPage.waitForPageLoad();
  });

  it('can log the user out', () => {
    authenticatedHomePage.waitForPageLoad();
    authenticatedHomePage.logout();
    loginHomePage.waitForPageLoad();
  });
});

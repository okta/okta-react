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

import {
  AppPage,
  ProtectedPage,
  SessionTokenSignInPage,
  LoginCallbackPage
} from '../page-objects/v6-app/index.js';
import OktaSignInPageV1 from '../page-objects/okta-signin-page.js';
import OktaSignInPageOIE from '../page-objects/okta-oie-signin-page.js';

let OktaSignInPage = OktaSignInPageV1;
if (process.env.ORG_OIE_ENABLED) {
  OktaSignInPage = OktaSignInPageOIE;
}

const { USERNAME, PASSWORD } = process.env;


// Exercises SecureOutlet from '@okta/okta-react/react-router-6' against react-router-dom v6
describe('React + Okta App (react-router-dom v6)', () => {
  describe('implicit flow', () => {

    it('should redirect to Okta for login when trying to access a protected page (implicit)', async () => {
      await ProtectedPage.open('?state=bar#baz');

      await OktaSignInPage.waitForPageLoad();
      await OktaSignInPage.login(USERNAME, PASSWORD);

      await ProtectedPage.waitForPageLoad('?state=bar#baz');
      expect(await ProtectedPage.logoutButton.isExisting()).toBeTruthy();

      await ProtectedPage.userInfo.waitForDisplayed();
      const userInfo = await ProtectedPage.userInfo.getText();
      expect(userInfo).toContain('email');

      await ProtectedPage.logoutButton.click();
      await AppPage.waitForLogout();
    });

    it('should redirect to Okta for login (implicit)', async () => {
      await AppPage.open();

      await AppPage.waitForPageLoad();

      expect(await AppPage.loginFlow.getText()).toBe('implicit');
      await AppPage.loginButton.click();

      await OktaSignInPage.waitForPageLoad();
      await OktaSignInPage.login(USERNAME, PASSWORD);

      await AppPage.waitForPageLoad();
      expect(await AppPage.logoutButton.isExisting()).toBeTruthy();

      await AppPage.logoutButton.click();
      await AppPage.waitForLogout();
    });

  });

  describe('PKCE flow', () => {

    it('should redirect to Okta for login when trying to access a protected page (pkce)', async () => {
      await ProtectedPage.open('?pkce=1&state=bar#baz');

      await OktaSignInPage.waitForPageLoad();
      await OktaSignInPage.login(USERNAME, PASSWORD);

      await LoginCallbackPage.waitForPageLoad();
      await ProtectedPage.waitForPageLoad('?pkce=1&state=bar#baz');
      expect(await ProtectedPage.logoutButton.isExisting()).toBeTruthy();

      await ProtectedPage.userInfo.waitForDisplayed();
      const userInfo = await ProtectedPage.userInfo.getText();
      expect(userInfo).toContain('email');

      await ProtectedPage.logoutButton.click();
      await AppPage.waitForLogout();
    });

    it('should redirect to Okta for login (pkce)', async () => {
      await AppPage.open('/?pkce=1');

      await AppPage.waitForPageLoad();
      expect(await AppPage.loginFlow.getText()).toBe('PKCE');
      await AppPage.loginButton.click();

      await OktaSignInPage.waitForPageLoad();
      await OktaSignInPage.login(USERNAME, PASSWORD);

      await LoginCallbackPage.waitForPageLoad();
      await AppPage.waitForPageLoad();
      expect(await AppPage.logoutButton.isExisting()).toBeTruthy();

      await AppPage.logoutButton.click();
      await AppPage.waitForLogout();
    });
  });

  describe('Okta session token flow', () => {

    it('should allow passing sessionToken to skip Okta login', async () => {
      await SessionTokenSignInPage.open();

      await SessionTokenSignInPage.waitForPageLoad();
      await SessionTokenSignInPage.login(USERNAME, PASSWORD);

      await AppPage.waitForPageLoad();
      expect(await AppPage.logoutButton.isExisting()).toBeTruthy();

      await AppPage.logoutButton.click();
      await AppPage.waitForLogout();
    });
  });

  describe('SecureOutlet', () => {
    it('should render nested child routes once authenticated', async () => {
      await ProtectedPage.open();

      await OktaSignInPage.waitForPageLoad();
      await OktaSignInPage.login(USERNAME, PASSWORD);

      await ProtectedPage.waitForPageLoad('');

      // The nested <Route element={<Protected />} /> only renders through SecureOutlet's <Outlet />
      await ProtectedPage.userInfo.waitForDisplayed();
      expect(await ProtectedPage.userInfo.getText()).toContain('email');

      await ProtectedPage.logoutButton.click();
      await AppPage.waitForLogout();
    });

    it('should redirect to Okta instead of rendering children when unauthenticated', async () => {
      await AppPage.open();
      await AppPage.waitForPageLoad();
      expect(await AppPage.loginButton.isExisting()).toBeTruthy();

      await ProtectedPage.open();

      // SecureOutlet starts the redirect rather than rendering its <Outlet />
      await OktaSignInPage.waitForPageLoad();

      // Having landed on Okta, the protected child never rendered
      expect(await ProtectedPage.userInfo.isExisting()).toBeFalsy();
    });
  });

});

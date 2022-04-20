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
} from '../page-objects/test-harness-app';
import OktaSignInPageV1 from '../page-objects/okta-signin-page';
import OktaSignInPageOIE from '../page-objects/okta-oie-signin-page';

let OktaSignInPage = OktaSignInPageV1;
if (process.env.ORG_OIE_ENABLED) {
  OktaSignInPage = OktaSignInPageOIE;
}

const { USERNAME, PASSWORD } = process.env;


describe('React + Okta App', () => {
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
  
      // Logout
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

      // Logout
      await AppPage.logoutButton.click();
      await AppPage.waitForLogout();
    });
  });

  describe('Router', () => {
    it('should honor the "exact" route param by not triggering the secureRoute', async () => {
      await ProtectedPage.open('/nested/');
      await ProtectedPage.waitForPageLoad('/nested');

      // Assert the navigation guard wasn't triggered due to "exact" path
      expect(await AppPage.loginButton.isExisting()).toBeTruthy();
    });
  });

});

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

/* eslint-disable */
// Extensions are explicit because jasmine loads specs through a native `import()`, which does not
// resolve extensionless relative specifiers.
import ClientJsRouterApp from '../page-objects/client-js-router-page.js';
import OktaSignInPageV1 from '../page-objects/okta-signin-page.js';
import OktaSignInPageOIE from '../page-objects/okta-oie-signin-page.js';

let OktaSignInPage = OktaSignInPageV1;
if (process.env.ORG_OIE_ENABLED) {
  OktaSignInPage = OktaSignInPageOIE;
}

const { ISSUER, PASSWORD } = process.env;
// In Windows, USERNAME is a built-in env var, so USER_NAME takes precedence - matches okta-hosted-login
const USERNAME = process.env.USER_NAME || process.env.USERNAME;

const widgetUri = ISSUER.split('/oauth')[0];

if (process.env.APP_NAME) {
  console.log(`Running client-js loader tests on ${process.env.APP_NAME}`);
}

describe('okta-react/client-js loaders', () => {
  let isAuthenticated = false;

  const testLogin = async (elemToClick) => {
    await elemToClick.click();

    await OktaSignInPage.waitForPageLoad();
    await expect(browser).toHaveUrlContaining(widgetUri);

    await OktaSignInPage.login(USERNAME, PASSWORD);
    isAuthenticated = true;
  };

  beforeEach(async () => {
    await ClientJsRouterApp.open();
  });

  afterEach(async () => {
    if (isAuthenticated) {
      await ClientJsRouterApp.open();
      // Best-effort: `isDisplayed()` alone doesn't wait for the element to exist, and in the SSR
      // app the button appears only once `clientLoader` has hydrated.
      const loggedIn = await ClientJsRouterApp.logoutButton
        .waitForDisplayed({ timeout: 5000 })
        .then(() => true, () => false);

      if (loggedIn) {
        await ClientJsRouterApp.logout();
      }
      isAuthenticated = false;
    }
  });

  it('should load the home page unauthenticated', async () => {
    await expect(ClientJsRouterApp.header).toExist();
    await expect(ClientJsRouterApp.loginButton).toBeDisplayed();
    await expect(ClientJsRouterApp.logoutButton).not.toExist();
  });

  it('should redirect to Okta when a token loader runs unauthenticated', async () => {
    await ClientJsRouterApp.protectedNavLink.click();

    await OktaSignInPage.waitForPageLoad();
    await expect(browser).toHaveUrlContaining(widgetUri);
  });

  it('should redirect to Okta when a fetch loader runs unauthenticated', async () => {
    await ClientJsRouterApp.resourceNavLink.click();

    await OktaSignInPage.waitForPageLoad();
    await expect(browser).toHaveUrlContaining(widgetUri);
  });

  it('should login from the home page sign in button', async () => {
    await testLogin(ClientJsRouterApp.loginButton);

    await ClientJsRouterApp.logoutButton.waitForDisplayed();
    await expect(browser).toHaveUrlContaining(`localhost:${process.env.PORT || 8080}`);
    await expect(ClientJsRouterApp.loginButton).not.toExist();
  });

  it('should render claims from createTokenLoader on the protected route', async () => {
    // Logs in from the home button, not the nav link - see the loader-triggered login test below.
    await testLogin(ClientJsRouterApp.loginButton);
    await ClientJsRouterApp.logoutButton.waitForDisplayed();

    await ClientJsRouterApp.protectedNavLink.click();
    await ClientJsRouterApp.claims.waitForDisplayed();
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(ClientJsRouterApp.header).toHaveTextContaining('Protected');

    const claims = JSON.parse(await ClientJsRouterApp.claims.getText());
    expect(claims.email).toBe(USERNAME);
  });

  it('should load a protected resource via createFetchLoader', async () => {
    // Logs in from the home button - see the loader-triggered login test below.
    await testLogin(ClientJsRouterApp.loginButton);
    await ClientJsRouterApp.logoutButton.waitForDisplayed();

    await ClientJsRouterApp.resourceNavLink.click();
    await ClientJsRouterApp.resource.waitForDisplayed();
    await expect(browser).toHaveUrlContaining('/resource');
    await expect(ClientJsRouterApp.header).toHaveTextContaining('Resource');
    await expect(ClientJsRouterApp.resource).toHaveTextContaining('This is a protected resource');
  });

  it('should return to the home route after a loader-triggered login', async () => {
    // Documents current behavior: `getOriginalUri` reads `window.location`, which React Router
    // hasn't updated yet mid-loader, so this returns to '/' rather than '/protected'. Flip once fixed.
    await testLogin(ClientJsRouterApp.protectedNavLink);

    await ClientJsRouterApp.logoutButton.waitForDisplayed();
    await expect(browser).toHaveUrl(`http://localhost:${process.env.PORT || 8080}/`);
    await expect(ClientJsRouterApp.claims).not.toExist();
  });

  it('should navigate between loader routes without re-authenticating', async () => {
    await testLogin(ClientJsRouterApp.loginButton);
    await ClientJsRouterApp.logoutButton.waitForDisplayed();

    await ClientJsRouterApp.protectedNavLink.click();
    await ClientJsRouterApp.claims.waitForDisplayed();
    await expect(browser).toHaveUrlContaining('/protected');

    await ClientJsRouterApp.homeNavLink.click();
    await ClientJsRouterApp.logoutButton.waitForDisplayed();

    await ClientJsRouterApp.resourceNavLink.click();
    await ClientJsRouterApp.resource.waitForDisplayed();
    await expect(browser).toHaveUrlContaining('/resource');

    await ClientJsRouterApp.homeNavLink.click();
    await ClientJsRouterApp.logoutButton.waitForDisplayed();
  });

  it('should return to the home page unauthenticated after logout', async () => {
    await testLogin(ClientJsRouterApp.loginButton);

    await ClientJsRouterApp.logout();
    isAuthenticated = false;

    await expect(ClientJsRouterApp.loginButton).toBeDisplayed();
    await expect(ClientJsRouterApp.logoutButton).not.toExist();

    await ClientJsRouterApp.protectedNavLink.click();
    await OktaSignInPage.waitForPageLoad();
    await expect(browser).toHaveUrlContaining(widgetUri);
  });
});

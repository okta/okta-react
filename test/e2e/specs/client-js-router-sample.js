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
// resolve extensionless relative specifiers. The older specs here omit them and only load under a
// CommonJS/babel path.
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

  // Both sample apps are unauthenticated-by-default: the home route renders a sign in button and
  // every other route's loader redirects to Okta when no credential is stored. `getToken()` kicks
  // off a full-page redirect, so there's nothing to await on the app side - the widget is next.
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
      // A test that failed partway through login may never have reached an authenticated state, so
      // this is best-effort - a teardown failure would mask the real failure in the report. Wait for
      // the button first: `isDisplayed()` doesn't wait for the element to exist, and in the SSR app
      // it only appears once `clientLoader` has hydrated, so an immediate check can read false and
      // skip a logout that was actually needed - leaking the credential into the next test.
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
    // Assert the sign in button is present *before* asserting the sign out button's absence:
    // `not.toBeDisplayed()` is also satisfied by an element that doesn't exist yet, so on its own it
    // would pass against a blank or still-hydrating page.
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
    // Logging in from the home button, then navigating, rather than clicking straight through to
    // `/protected`: the orchestrator's default `getOriginalUri` reads `window.location`, which React
    // Router hasn't updated yet while a loader is running, so a login triggered *by* a loader
    // captures the pre-navigation URL and returns here instead of the route that was asked for. See
    // the `originalUri` note in the PR - until that's addressed, post-login lands on '/'.
    await testLogin(ClientJsRouterApp.loginButton);
    await ClientJsRouterApp.logoutButton.waitForDisplayed();

    await ClientJsRouterApp.protectedNavLink.click();
    await ClientJsRouterApp.claims.waitForDisplayed();
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(ClientJsRouterApp.header).toHaveTextContaining('Protected');

    // Assert on the `email` claim by name rather than substring-matching the whole JSON blob, so a
    // claim-mapping change in the test org fails with a comprehensible message.
    const claims = JSON.parse(await ClientJsRouterApp.claims.getText());
    expect(claims.email).toBe(USERNAME);
  });

  it('should load a protected resource via createFetchLoader', async () => {
    // Same reason as above for logging in from the home button first.
    await testLogin(ClientJsRouterApp.loginButton);
    await ClientJsRouterApp.logoutButton.waitForDisplayed();

    await ClientJsRouterApp.resourceNavLink.click();
    await ClientJsRouterApp.resource.waitForDisplayed();
    await expect(browser).toHaveUrlContaining('/resource');
    await expect(ClientJsRouterApp.header).toHaveTextContaining('Resource');
    await expect(ClientJsRouterApp.resource).toHaveTextContaining('This is a protected resource');
  });

  it('should return to the home route after a loader-triggered login', async () => {
    // Documents current behavior, which is not ideal: clicking through to a protected route while
    // unauthenticated returns to '/' after login rather than the route that was requested, because
    // `getOriginalUri` reads `window.location` before React Router has committed the new URL. The
    // credential is stored either way, so the user is authenticated - just not where they asked to
    // be. Flip this to assert '/protected' once `originalUri` is resolved.
    await testLogin(ClientJsRouterApp.protectedNavLink);

    await ClientJsRouterApp.logoutButton.waitForDisplayed();
    await expect(ClientJsRouterApp.header).toHaveTextContaining('Home');
  });

  it('should navigate between loader routes without re-authenticating', async () => {
    await testLogin(ClientJsRouterApp.loginButton);
    await ClientJsRouterApp.logoutButton.waitForDisplayed();

    // Both loaders reuse the stored credential, so neither navigation leaves the app.
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

    // The credential is gone, so a loader route redirects to Okta again rather than rendering.
    await ClientJsRouterApp.protectedNavLink.click();
    await OktaSignInPage.waitForPageLoad();
    await expect(browser).toHaveUrlContaining(widgetUri);
  });
});

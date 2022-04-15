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
import RouterSampleApp from  '../page-objects/router-sample-page';
import OktaSignInPageV1 from '../page-objects/okta-signin-page';
import OktaSignInPageOIE from '../page-objects/okta-oie-signin-page';

let OktaSignInPage = OktaSignInPageV1;
if (process.env.ORG_OIE_ENABLED) {
  OktaSignInPage = OktaSignInPageOIE;
}

const { ISSUER, USERNAME, PASSWORD } = process.env;

const widgetUri = ISSUER.split('/oauth')[0];

if (process.env.APP_NAME) {
  console.log(`Running router tests on ${process.env.APP_NAME}`);
}

describe('React router test app', () => {
  let isAuthenticated = false;

  const testLogin = async (elemToClick) => {
    await elemToClick.click();
  
    await OktaSignInPage.waitForPageLoad();
    await expect(browser).toHaveUrlContaining(widgetUri);
  
    await OktaSignInPage.login(USERNAME, PASSWORD);
    isAuthenticated = true;
    await RouterSampleApp.loadingIcon.waitForDisplayed();
    await RouterSampleApp.header.waitForDisplayed();
  };

  beforeEach(async () => {
    await RouterSampleApp.open();
  });

  afterEach(async () => {
    if (isAuthenticated) {
      await RouterSampleApp.logout();
      isAuthenticated = false;
    }
  });

  it('should load home page', async () => {
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Home');
  });

  it('should navigate to login when accessing protected route while unauthenticated', async () => {
    await RouterSampleApp.protectedNavLink.click();
    await expect(RouterSampleApp.loadingIcon).toExist();
    await expect(RouterSampleApp.loadingIcon).toHaveTextContaining('Loading...');

    await OktaSignInPage.waitForPageLoad();
    await expect(browser).toHaveUrlContaining(widgetUri);
  });

  it('should login user after redirect from <SecureRoute>', async () => {
    await testLogin(RouterSampleApp.protectedNavLink);
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Protected');
  });

  it('should login user after redirect from Login button', async () => {
    await expect(RouterSampleApp.footerBtn).toHaveText('Login');
    await testLogin(RouterSampleApp.footerBtn);
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Home');
    await expect(RouterSampleApp.footerBtn).toHaveText('Logout');
  });

  it('should navigate user to Home Page after logout on Protected Page', async () => {
    await testLogin(RouterSampleApp.protectedNavLink);
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Protected');
    await RouterSampleApp.logout();
    isAuthenticated = false;
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Home');
  });

  it('can toggle between tabs once authenticated', async () => {
    await expect(RouterSampleApp.footerBtn).toHaveText('Login');
    await testLogin(RouterSampleApp.footerBtn);
    await expect(RouterSampleApp.footerBtn).toHaveText('Logout');

    // on Home Page
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Home');

    // navigate to Protected Page
    await RouterSampleApp.protectedNavLink.click();
    await RouterSampleApp.header.waitForDisplayed();

    // on Protected Page
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Protected');

    // navigate to Home Page
    await RouterSampleApp.homeNavLink.click();
    await RouterSampleApp.header.waitForDisplayed();

    // on Home Page
    await expect(RouterSampleApp.header).toExist();
    await expect(RouterSampleApp.header).toHaveTextContaining('Home');
  });
});

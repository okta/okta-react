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
import TestApp from  '../page-objects/RouterTestAppPage';
import { waitForLoad } from '../utils/waitForLoad';

const { ISSUER, USERNAME, PASSWORD } = process.env;

describe('React router test app', () => {
  let isAuthenticated = false;

  const testLogin = async (elemToClick) => {
    await elemToClick.click();
  
    await waitForLoad(TestApp.widget);
    await expect(browser).toHaveUrlContaining(`${ISSUER}/v1/authorize`);
  
    await TestApp.login(USERNAME, PASSWORD);
    isAuthenticated = true;
    await waitForLoad(TestApp.loadingIcon);
    await waitForLoad(TestApp.header);
  };

  beforeEach(async () => {
    await TestApp.open();
  });

  afterEach(async () => {
    if (isAuthenticated) {
      await TestApp.logout();
      isAuthenticated = false;
    }
  });

  it('should load home page', async () => {
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Home');
  });

  it('should navigate to login when accessing protected route while unauthenticated', async () => {
    await TestApp.protectedNavLink.click();
    await expect(TestApp.loadingIcon).toExist();
    await expect(TestApp.loadingIcon).toHaveTextContaining('Loading...');

    await waitForLoad(TestApp.widget);
    await expect(browser).toHaveUrlContaining(`${ISSUER}/v1/authorize`);
  });

  it('should login user after redirect from <SecureRoute>', async () => {
    await testLogin(TestApp.protectedNavLink);
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Protected');
  });

  it('should login user after redirect from Login button', async () => {
    await expect(TestApp.footerBtn).toHaveText('Login');
    await testLogin(TestApp.footerBtn);
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Home');
    await expect(TestApp.footerBtn).toHaveText('Logout');
  });

  it('should navigate user to Home Page after logout on Protected Page', async () => {
    await testLogin(TestApp.protectedNavLink);
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Protected');
    await TestApp.logout();
    isAuthenticated = false;
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Home');
  });

  it('can toggle between tabs once authenticated', async () => {
    await expect(TestApp.footerBtn).toHaveText('Login');
    await testLogin(TestApp.footerBtn);
    await expect(TestApp.footerBtn).toHaveText('Logout');

    // on Home Page
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Home');

    // navigate to Protected Page
    await TestApp.protectedNavLink.click();
    await waitForLoad(TestApp.header);

    // on Protected Page
    await expect(browser).toHaveUrlContaining('/protected');
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Protected');

    // navigate to Home Page
    await TestApp.homeNavLink.click();
    await waitForLoad(TestApp.header);

    // on Home Page
    await expect(TestApp.header).toExist();
    await expect(TestApp.header).toHaveTextContaining('Home');
  });
});

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
import OktaSignInPageV1 from '../page-objects/okta-signin-page';
import OktaSignInPageOIE from '../page-objects/okta-oie-signin-page';
import AuthenticatedHomePage from '../page-objects/shared/authenticated-home-page';
import ProfilePage from '../page-objects/shared/profile-page';
import MessagesPage from '../page-objects/messages-page';
import AuthenticatorsPage from '../page-objects/authenticators-page';
import MFAChallengePage from '../page-objects/mfa-challenge-page';
import url from 'url';
import axios from 'axios';

let OktaSignInPage = OktaSignInPageV1;
if (process.env.ORG_OIE_ENABLED) {
  OktaSignInPage = OktaSignInPageOIE;
}

// TODO: first few tests only works with v1 widget page object

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

const exists = list => list.every(a => a !== undefined);

describe('Custom Login Flow', () => {
  const appRoot = `http://localhost:${params.appPort}`;

  beforeEach(() => {
    if (!process.env.CODE_WAIT_TIME) {
      console.log('Setting default wait time for code to 5 seconds')
      process.env.CODE_WAIT_TIME = 5000;
    }
  });

  it('can login with Okta as the IDP using custom signin page', async () => {
    await browser.url(appRoot);
    await LoginHomePage.waitForPageLoad();

    await LoginHomePage.clickLoginButton();
    await OktaSignInPage.waitForPageLoad();

    // Verify that current domain hasn't changed to okta-hosted login, rather a local custom login page
    const urlProperties = url.parse(process.env.ISSUER);
    expect(browser).not.toHaveUrlContaining(urlProperties.host);
    expect(browser).toHaveUrlContaining(appRoot);

    await OktaSignInPage.login(params.login.username, params.login.password);
    await AuthenticatedHomePage.waitForPageLoad();
    await AuthenticatedHomePage.waitForWelcomeTextToLoad();
    expect(await AuthenticatedHomePage.getUIText()).toContain('Welcome');
  });

  it('can access user ProfilePage', async () => {
    await AuthenticatedHomePage.viewProfile();
    await ProfilePage.waitForPageLoad();
    expect(await ProfilePage.getEmailClaim()).toBe(params.login.email);
  });

  it('can access resource server messages after login',  async () => {
    // If it's not implicit flow, don't test messages resource server
    if (process.env.TEST_TYPE !== 'implicit') {
      return;
    }
    await AuthenticatedHomePage.viewMessages();
    await MessagesPage.waitForPageLoad();
    expect(await MessagesPage.getMessage()).toBeTruthy();
  });

  it('can log the user out', async () => {
    await browser.url(appRoot);
    await AuthenticatedHomePage.waitForPageLoad();
    await AuthenticatedHomePage.logout();
    await LoginHomePage.waitForPageLoad();
  });

  it('can login with email authenticator', async () => {
    // This test runs only on OIE enabled orgs
    if (!exists([
      process.env.ORG_OIE_ENABLED,
      process.env.EMAIL_MFA_USERNAME,
      process.env.PASSWORD,
      process.env.EMAIL_MFA_USERNAME,
    ])) {
      console.warn('Skipping test due to missing env vars');
      return;
    }

    await browser.url(appRoot);
    await LoginHomePage.waitForPageLoad();

    await LoginHomePage.clickLoginButton();
    await OktaSignInPage.waitForPageLoad();

    await OktaSignInPage.login(process.env.EMAIL_MFA_USERNAME, process.env.PASSWORD);

    await AuthenticatorsPage.waitForPageLoad();
    await AuthenticatorsPage.clickAuthenticatorByLabel('Email');
    await MFAChallengePage.waitForPageLoad();

    // Wait for 5 seconds (default) for email to be received
    await browser.pause(process.env.CODE_WAIT_TIME);

    // Get the email passcode using ghostinspector email API endpoint
    try {
      const response = await axios.get(`https://email.ghostinspector.com/${process.env.EMAIL_MFA_USERNAME}/latest`);
      const emailCode = response.data.match(/Enter a code instead: <b>(\d+)/i)[1];
      await MFAChallengePage.enterPasscode(emailCode);
      await MFAChallengePage.clickSubmitButton();
    }
    catch (err) {
      console.log(err);
    }

    await AuthenticatedHomePage.waitForPageLoad();
    await AuthenticatedHomePage.logout();
    await LoginHomePage.waitForPageLoad();
  });

  it('can login with SMS authenticator', async () => {
    // This test runs only on OIE enabled orgs
    if (!exists([
      process.env.ORG_OIE_ENABLED,
      process.env.SMS_MFA_USERNAME,
      process.env.PASSWORD,
      process.env.TWILIO_ACCOUNT,
      process.env.TWILIO_API_TOKEN
    ])) {
      console.warn('Skipping test due to missing env vars');
      return;
    }

    await browser.get(appRoot);
    await LoginHomePage.waitForPageLoad();

    await LoginHomePage.clickLoginButton();
    await OktaSignInPage.waitForPageLoad();

    await OktaSignInPage.login(process.env.SMS_MFA_USERNAME, process.env.PASSWORD);

    await AuthenticatorsPage.waitForPageLoad();
    await AuthenticatorsPage.clickAuthenticatorByLabel('Phone');
    await MFAChallengePage.clickSubmitButton();

    // Wait for 5 seconds (default) for SMS to be received
    await browser.pause(process.env.CODE_WAIT_TIME);

    const TWILIO_ACCOUNT = process.env.TWILIO_ACCOUNT;
    const TWILIO_API_TOKEN = process.env.TWILIO_API_TOKEN;

    try {
      // This endpoint returns all the SMSes sent to the twilio test number (shared between multiple orgs)
      const response = await axios.get(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT}/Messages.json`, {
        auth: {
          username: `${TWILIO_ACCOUNT}`,
          password: `${TWILIO_API_TOKEN}`
        }
      });
      const data = response.data;
      const size = data.end;
      
      // The format of the SMS sent is "Your ${org.name} verification code is ${code}"
      // The prefix should be based on your org name. Currently it's hardcoded to use the "OIE Widget Testing" org
      const prefix = 'Your OIE Widget Testing verification code is';
      const regex = ' (([0-9][0-9][0-9][0-9][0-9][0-9]))';
      
      // Loop through all the messages and fetch the one that matches the prefix for your org
      let messageBody = "";
      for (var i = 0; i < size; i++) {
          if (data.messages[i].body.indexOf(prefix) > -1) {
              messageBody = data.messages[i].body;
              break;
          }
      }
      
      const smsCode = messageBody.match(new RegExp(regex))[1];

      await MFAChallengePage.waitForPageLoad();
      await MFAChallengePage.enterPasscode(smsCode);
      await MFAChallengePage.clickSubmitButton();
    }
    catch (err) {
      console.log(err);
    }

    await AuthenticatedHomePage.waitForPageLoad();
    await AuthenticatedHomePage.logout();
    await LoginHomePage.waitForPageLoad();
  });

  it('can login with facebook as IdP', async () => {
    // This test runs only on OIE enabled orgs
    if (!exists([process.env.ORG_OIE_ENABLED, process.env.FB_USERNAME, process.env.FB_PASSWORD])) {
      console.warn('Skipping test due to missing env vars');
      return;
    }

    await browser.url(appRoot);
    await LoginHomePage.waitForPageLoad();

    await LoginHomePage.clickLoginButton();
    await OktaSignInPage.waitForPageLoad();

    await OktaSignInPage.loginFacebook(process.env.FB_USERNAME, process.env.FB_PASSWORD);
    await AuthenticatedHomePage.waitForPageLoad();
    await AuthenticatedHomePage.waitForWelcomeTextToLoad();
    expect(await AuthenticatedHomePage.getUIText()).toContain('Welcome');
  });
  
});

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
let OktaSignInPage = require('../page-objects/okta-signin-page');

if (process.env.ORG_OIE_ENABLED) {
  OktaSignInPage = require('../page-objects/okta-oie-signin-page');
}

const AuthenticatedHomePage = require('../page-objects/shared/authenticated-home-page');
const ProfilePage = require('../page-objects/shared/profile-page');
const MessagesPage = require('../page-objects/messages-page');
const AuthenticatorsPage = require('../page-objects/authenticators-page');
const MFAChallengePage = require('../page-objects/mfa-challenge-page');
const url = require('url');
const axios = require('axios');

describe('Okta Hosted Login Flow', () => {
  const loginHomePage = new LoginHomePage();
  const oktaSignInPage = new OktaSignInPage();
  const authenticatedHomePage = new AuthenticatedHomePage();
  const profile = new ProfilePage();
  const messagesPage = new MessagesPage();
  const authenticatorsPage = new AuthenticatorsPage();
  const mfaChallengePage = new MFAChallengePage();
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
  });

  afterAll(() => {
    return browser.driver.close().then(() => {
      browser.driver.quit();
    });
  });

  it('can login with Okta as the IDP', () => {   
    browser.get(appRoot);
    loginHomePage.waitForPageLoad();

    loginHomePage.clickLoginButton();
    oktaSignInPage.waitForPageLoad();

    // Verify that current domain has changed to okta-hosted login page
    const urlProperties = url.parse(process.env.ISSUER);
    expect(browser.getCurrentUrl()).toContain(urlProperties.host);
    expect(browser.getCurrentUrl()).not.toContain(appRoot);

    oktaSignInPage.login(browser.params.login.username, browser.params.login.password);
    authenticatedHomePage.waitForPageLoad();
    authenticatedHomePage.waitForWelcomeTextToLoad();
    expect(authenticatedHomePage.getUIText()).toContain('Welcome');
  });

  it('can access user profile', () => {
    authenticatedHomePage.viewProfile();
    profile.waitForPageLoad();
    expect(profile.getEmailClaim()).toBe(browser.params.login.email);
  });

  it('can access resource server messages after login', () => {
    // If it's not implicit flow, don't test messages resource server
    if (process.env.TEST_TYPE !== 'implicit') {
      return;
    }
    authenticatedHomePage.viewMessages();
    messagesPage.waitForPageLoad();
    expect(messagesPage.getMessage()).toBeTruthy();
  });

  it('can log the user out', () => {
    browser.get(appRoot);
    authenticatedHomePage.waitForPageLoad();
    authenticatedHomePage.logout();
    loginHomePage.waitForPageLoad();
  });

  it('can login with email authenticator', async () => {
    // This test runs only on OIE enabled orgs
    if (!process.env.ORG_OIE_ENABLED) {
      return;
    }

    await browser.get(appRoot);
    await loginHomePage.waitForPageLoad();

    await loginHomePage.clickLoginButton();
    await oktaSignInPage.waitForPageLoad();

    await oktaSignInPage.login(process.env.EMAIL_MFA_USERNAME, process.env.PASSWORD);

    await authenticatorsPage.waitForPageLoad();
    authenticatorsPage.clickAuthenticatorByLabel('Email');
    await mfaChallengePage.waitForPageLoad();

    // Wait for 5 seconds (default) for email to be received
    await browser.sleep(process.env.CODE_WAIT_TIME);

    // Get the email passcode using ghostinspector email API endpoint
    await axios.get(`https://email.ghostinspector.com/${process.env.EMAIL_MFA_USERNAME}/latest`).then((response) => {
      const emailCode = response.data.match(/Enter a code instead: <b>(\d+)/i)[1];
      mfaChallengePage.enterPasscode(emailCode);
      mfaChallengePage.clickSubmitButton();
    }).catch((err) => {
      console.log(err);
    });

    authenticatedHomePage.waitForPageLoad();
    authenticatedHomePage.logout();
    loginHomePage.waitForPageLoad();
  });

  it('can login with SMS authenticator', async () => {
    // This test runs only on OIE enabled orgs
    if (!process.env.ORG_OIE_ENABLED) {
      return;
    }

    await browser.get(appRoot);
    await loginHomePage.waitForPageLoad();

    await loginHomePage.clickLoginButton();
    await oktaSignInPage.waitForPageLoad();

    await oktaSignInPage.login(process.env.SMS_MFA_USERNAME, process.env.PASSWORD);

    await authenticatorsPage.waitForPageLoad();
    authenticatorsPage.clickAuthenticatorByLabel('Phone');
    mfaChallengePage.clickSubmitButton();

    // Wait for 5 seconds (default) for SMS to be received
    await browser.sleep(process.env.CODE_WAIT_TIME);

    const TWILIO_ACCOUNT = process.env.TWILIO_ACCOUNT;
    const TWILIO_API_TOKEN = process.env.TWILIO_API_TOKEN;

    // This endpoint returns all the SMSes sent to the twilio test number (shared between multiple orgs)
    await axios.get(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT}/Messages.json`, {
      auth: {
        username: `${TWILIO_ACCOUNT}`,
        password: `${TWILIO_API_TOKEN}`
      }
    }).then((response) => {
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

      mfaChallengePage.waitForPageLoad();
      mfaChallengePage.enterPasscode(smsCode);
      mfaChallengePage.clickSubmitButton();
    }).catch((err) => {
      console.log(err);
    });

    authenticatedHomePage.waitForPageLoad();
    authenticatedHomePage.logout();
    loginHomePage.waitForPageLoad();
  });

  it('can login with facebook as IdP', () => {
    // This test runs only on OIE enabled orgs
    if (!process.env.ORG_OIE_ENABLED) {
      return;
    }

    browser.get(appRoot);
    loginHomePage.waitForPageLoad();

    loginHomePage.clickLoginButton();
    oktaSignInPage.waitForPageLoad();

    oktaSignInPage.loginFacebook(process.env.FB_USERNAME, process.env.FB_PASSWORD);
    authenticatedHomePage.waitForPageLoad();
    authenticatedHomePage.waitForWelcomeTextToLoad();
    expect(authenticatedHomePage.getUIText()).toContain('Welcome');
  });

});

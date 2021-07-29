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

const { browser } = require('protractor');
const util = require('./shared/util');

function input(field) {
  const inputWrap = `o-form-input-${field}`;
  return $(`${util.se(inputWrap)} input`);
} 

class OktaSignInPage {

  constructor() {
    this.identifierInput = $('[name="identifier"]');
    this.passcodeInput = $('[name="credentials.passcode"]');
    this.nextButton = $('[data-type="save"]');
    this.facebookLoginButton = $('[data-se="social-auth-facebook-button"]');
    this.facebookEmail = $('#email');
    this.facebookPassword = $('#pass');
    this.facebookSubmitBtn = $('#loginbutton');
  }

  waitForPageLoad() {
    return util.wait(this.identifierInput);
  }

  login(username, password) {
    this.identifierInput.sendKeys(username);
    this.passcodeInput.isPresent().then((present) => {
      // Idenfitier first flow if passcode input is not present on widget
      if (!present) {
        this.nextButton.click();
        util.wait(this.passcodeInput);
        this.passcodeInput.sendKeys(password);
        return this.nextButton.click();
      } else { // Identifier and passcode on same screen
        this.passcodeInput.sendKeys(password);
        return this.nextButton.click();  
      }
    });
  }

  loginFacebook(username, password) {
    this.facebookLoginButton.click();
    util.wait(this.facebookEmail);

    this.facebookEmail.sendKeys(username);
    this.facebookPassword.sendKeys(password);
    this.facebookSubmitBtn.click();
  }

  urlContains(str) {
    return util.urlContains(str);
  }
}

module.exports = OktaSignInPage;

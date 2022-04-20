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


class OktaSignInPage {

  get identifierInput () { return $('[name="identifier"]'); }
  get passcodeInput () { return $('[name="credentials.passcode"]'); }
  get nextButton () { return $('[data-type="save"]'); }
  get facebookLoginButton () { return $('[data-se="social-auth-facebook-button"]'); }
  get facebookEmail () { return $('#email'); }
  get facebookPassword () { return $('#pass'); }
  get facebookSubmitBtn () { return $('#loginbutton'); }

  waitForPageLoad() {
    return this.identifierInput.waitForDisplayed();
  }

  async login(username, password) {
    await this.identifierInput.setValue(username);
    const present = await this.passcodeInput.isDisplayed();

    // Idenfitier first flow if passcode input is not present on widget
    if (!present) {
      await this.nextButton.click();
      await this.passcodeInput.waitForDisplayed();
      await this.passcodeInput.setValue(password);
      await this.nextButton.click();
    } 
    else { // Identifier and passcode on same screen
      await this.passcodeInput.setValue(password);
      await this.nextButton.click();  
    }
  }

  async loginFacebook(username, password) {
    await this.facebookLoginButton.click();
    await this.facebookEmail.waitForDisplayed();

    await this.facebookEmail.setValue(username);
    await this.facebookPassword.setValue(password);
    await this.facebookSubmitBtn.click();
  }

}

export default new OktaSignInPage();

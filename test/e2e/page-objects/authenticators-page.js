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

class AuthenticatorsPage {
  
  get authenticatorLabel () { return $('.authenticator-label'); }
  get selectAuthenticatorButton () { return $('[class="authenticator-button"] [data-se="button"]'); }

  waitForPageLoad() {
    return this.selectAuthenticatorButton.waitForDisplayed();
  }

  async clickAuthenticatorByLabel(label) {
    await this.authenticatorLabel.waitForDisplayed();

    let index = 0;
    for await (let element of this.authenticatorLabel) {
      const text = await element.getText();
      if (text.includes(label) > 0) {
        this.selectAuthenticatorButton[index].click();
      }
      index++;
    }
  }
}

export default new AuthenticatorsPage();

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


class MFAChallengePage {

  get passcodeSelector () { return $('[name="credentials.passcode"]'); }
  get submitButton () { return $('input[data-type="save"]'); }

  waitForPageLoad() {
    return this.passcodeSelector.waitForDisplayed();
  }

  async clickSubmitButton() {
    await this.submitButton.waitForDisplayed();
    await this.submitButton.click();
  }

  async enterPasscode(passcode) {
    await this.passcodeSelector.setValue(passcode);
  }

  // TODO: is this used?
  // getEmailPasscode() {
  //   util.wait(this.passcodeSelector);
  // }
}

export default new MFAChallengePage();
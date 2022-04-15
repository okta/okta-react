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

class AuthenticatedHomePage {

  get profileButton () { return  $('#profile-button'); }
  get protectedButton () { return  $('a[href="/protected"]'); }
  get logoutButton () { return  $('#logout-button'); }
  get textContainer () { return  $('.text.container'); }
  get messagesLink () { return  $('a:contains(\'Messages\')'); }

  waitForPageLoad() {
    return this.logoutButton.waitForDisplayed();
  }

  waitForProtectedButton() {
    return this.protectedButton.waitForDisplayed();
  }

  logout() {
    return this.logoutButton.click();
  }

  viewProfile() {
    return this.profileButton.click();
  }

  viewProtectedPage() {
    return this.protectedButton.click();
  }

  viewMessages() {
    return this.messagesLink.click();
  }

  async waitForWelcomeTextToLoad() {
    await this.textContainer.waitForDisplayed();
    await browser.waitUntil(async () => {
      const text = await this.textContainer.getText();
      return text.includes('Welcome');
    }, 5000, 'wait for element to load with text');
  }

  getUIText() {
    return this.textContainer.getText();
  }
}

export default new AuthenticatedHomePage();

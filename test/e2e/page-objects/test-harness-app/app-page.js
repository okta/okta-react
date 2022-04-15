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


class AppPage {
  
  // Home Page
  get loginButton () { return $('#login-button'); }
  get logoutButton () { return $('#logout-button'); }
  get protectedButton () { return $('#protected-button'); }
  get loginFlow () { return $('#login-flow'); }

  waitForPageLoad() {
    return browser.waitUntil(async () => {
      try {
        await Promise.race([
          this.loginButton.waitForDisplayed({timeout: 20000}),
          this.logoutButton.waitForDisplayed({timeout: 20000})
        ]);
        return true;
      }
      catch (err) {
        return false;
      }
    })
  }

  waitForLogout () {
    return this.loginButton.waitForDisplayed();
  }

  open (path='/') {
    return browser.url(path);
  }
}

export default new AppPage();

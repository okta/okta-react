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

/**
* Shared by both @okta/okta-react/client-js sample apps - they render different routers but expose
* the same ids.
*/
const PORT = process.env.PORT || 8080;

class ClientJsRouterAppPage {

  get header () { return $('h1'); }
  get loginButton () { return $('#login-button'); }
  get logoutButton () { return $('#logout-button'); }
  get homeNavLink () { return $('#home-nav-link'); }
  get protectedNavLink () { return $('#protected-nav-link'); }
  get resourceNavLink () { return $('#resource-nav-link'); }
  get claims () { return $('#claims'); }
  get resource () { return $('#resource'); }
  get errorMessage () { return $('#error-message'); }

  /**
  * Signs out via Okta's end-session endpoint and waits for the redirect back to the home page.
  */
  async logout () {
    await this.logoutButton.waitForDisplayed();
    await this.logoutButton.click();
    await this.loginButton.waitForDisplayed();
  }

  /**
  * Opens a sub page of the page
  * @param path path of the sub page (e.g. /path/to/page.html)
  */
  open (path='/') {
    return browser.url(`http://localhost:${PORT}${path}`);
  }
}

export default new ClientJsRouterAppPage();

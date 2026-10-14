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
* Page object shared by both @okta/okta-react/client-js sample apps - client-js-router-v8-app and
* client-js-router-v7-ssr-app. The two render different routers (a data router vs. React Router
* framework mode with SSR) but expose the same ids, so one page object covers both.
*
* Both apps serve on 8080, which the runner passes in as PORT. The port is fixed rather than
* arbitrary: the test org registers `http://localhost:8080/login/callback` as the app's only login
* redirect URI, so a different origin gets rejected by /authorize before the widget ever renders.
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
  * `signOutFlow` removes the local credential before redirecting, so the login button is what
  * comes back.
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

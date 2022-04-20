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
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
class RouterSampleAppPage {

  // Router App selectors
  get header () { return $('main h1.page-header'); }
  get homeNavLink () { return $('#home-nav-link'); }
  get protectedNavLink () { return $('#protected-nav-link'); }
  get loadingIcon () { return $('#loading-icon'); }
  get footerBtn () { return $('footer > button[type="button"]'); }

  async logout () {
    await expect(this.footerBtn).toHaveText('Logout');
    await this.footerBtn.click();
    await browser.waitUntil(async () => await this.footerBtn.getText() === 'Login', {timeoutMsg: 'Could not find logout button'});
  }

  /**
  * Opens a sub page of the page
  * @param path path of the sub page (e.g. /path/to/page.html)
  */
  open (path='/') {
    return browser.url(`http://localhost:8080${path}`);
  }
}

export default new RouterSampleAppPage();

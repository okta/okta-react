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

const util = require('./util');

class AuthenticatedHomePage {

  constructor() {
    this.$profileButton = $('#profile-button');
    this.$logoutButton = $('#logout-button');
    this.$textContainer = $('.text.container');

    // For asp.net webforms you can't have ids with hyphens
    // https://stackoverflow.com/questions/25919471/how-to-get-html-control-by-id-that-has-hyphens
  	if (__dirname.indexOf('samples-aspnet-webforms') > -1) {
      this.$profileButton = $('#profileButton');
      this.$logoutButton = $('#logoutButton');
    }

    this.$messagesLink = element(by.partialLinkText('Messages'));
  }

  waitForPageLoad() {
    return util.wait(this.$logoutButton);
  }

  logout() {
    return this.$logoutButton.click();
  }

  viewProfile() {
    return this.$profileButton.click();
  }

  viewMessages() {
    return this.$messagesLink.click();
  }

  waitForWelcomeTextToLoad() {
    return util.waitTillElementContainsText(this.$textContainer, 'Welcome');
  }

  getUIText() {
    browser.wait(this.$textContainer.getText());
    return this.$textContainer.getText();
  }
}

module.exports = AuthenticatedHomePage;

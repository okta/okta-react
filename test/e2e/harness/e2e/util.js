/*!
 * Copyright (c) 2017-2020Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


import {browser, ExpectedConditions} from 'protractor';
var EC = ExpectedConditions;

export class Util {
  static waitElement (elementFinder, timeoutMilliseconds) {
    if (timeoutMilliseconds === undefined) {
      //use default timeout
      return browser.wait(EC.presenceOf(elementFinder));
    } else {
      return browser.wait(EC.presenceOf(elementFinder), timeoutMilliseconds);
    }
  }

  static waitElementOr (elementFinderOne, elementFinderTwo, timeoutMilliseconds) {
    const elemOneExists = EC.presenceOf(elementFinderOne);
    const elemTwoExists = EC.presenceOf(elementFinderTwo);
    if (timeoutMilliseconds === undefined) {
      //use default timeout
      return browser.wait(EC.or(elemOneExists, elemTwoExists));
    } else {
      return browser.wait(EC.or(elemOneExists, elemTwoExists), timeoutMilliseconds);
    }
  }

  static waitUrlContains(path, timeoutMilliseconds) {
    if (timeoutMilliseconds === undefined) {
      //use default timeout
      return browser.wait(EC.urlContains(path));
    } else {
      return browser.wait(EC.urlContains(path), timeoutMilliseconds);
    }
  }
}

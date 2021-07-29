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

const EC = protractor.ExpectedConditions;
const util = module.exports = {};

util.wait = (elementFinder) => {
  return browser.wait(EC.presenceOf(elementFinder));
};

util.se = val => `[data-se="${val}"]`;

util.urlContains = (str) => {
  return EC.urlContains(str)();
}

util.waitTillElementContainsText = (elem, text) => {
  return browser.wait(EC.textToBePresentInElement(elem, text));
}

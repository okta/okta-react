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

module.exports = [
  {
    name: '@okta/samples.react.okta-hosted-login',
    useSiw: false,
    specs: [
      'okta-hosted-login'
    ]
  },
  {
    name: '@okta/samples.react.custom-login',
    useSiw: true,
    specs: [
      'custom-login'
    ]
  },
  {
    name: '@okta/samples.react.doc-embedded-widget',
    useSiw: true,
    specs: [
      'doc-embedded-widget'
    ]
  },
  {
    name: '@okta/samples.react.doc-direct-auth',
    useSiw: false,
    specs: [
      'doc-direct-auth'
    ]
  }
];

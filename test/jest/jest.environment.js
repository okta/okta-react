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

const { default: JSDOMEnvironment } = require('jest-environment-jsdom');

// jsdom doesn't implement the Fetch API, which react-router-dom v6.4+'s data router relies on
// (`createMemoryRouter` reads the global Request/Response, and `isResponse()` duck-checks loader
// return values). Node has provided spec-compliant implementations since 18, but jsdom sandboxes
// its own global scope, so they have to be copied in from out here - inside the sandbox
// (setupFiles) they aren't reachable.
class FetchCapableJSDOMEnvironment extends JSDOMEnvironment {
  async setup () {
    await super.setup();
    Object.assign(this.global, {
      fetch,
      Headers,
      Request,
      Response,
      ReadableStream,
      // Node's Request constructor rejects a `signal` that isn't an instance of *its* AbortSignal,
      // and the data router builds one from the environment's AbortController. Both have to come
      // from the same realm or every router navigation throws.
      AbortController,
      AbortSignal,
    });
  }
}

module.exports = FetchCapableJSDOMEnvironment;

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

// reference: https://github.com/jestjs/jest/issues/5248#issuecomment-748920069
async function toResolve(promise: any) {
  if (!(promise instanceof Promise)) {
    return {
      pass: false,
      message: () => `expected is not a instance of a Promise`
    }
  }

  let resolved = false;
  try {
    await promise;
    resolved = true;
  }
  catch {
    resolved = false;
  }

  return {
    pass: resolved,
    message: () => `expected promise to resolve`
  };
}

expect.extend({
  toResolve
});

/*
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

import type { AuthorizationCodeFlowOrchestrator } from '@okta/spa-platform';
import { createTokenLoader } from './createTokenLoader';
import { createLoginCallbackLoader } from './createLoginCallbackLoader';

/**
 * Binds a single {@link AuthorizationCodeFlowOrchestrator} instance to both {@link createTokenLoader} and
 * {@link createLoginCallbackLoader}.
 *
 * The login callback route stores the credential that the token loader later reads back from the same
 * orchestrator - passing two separately-constructed orchestrator instances to those loaders would silently
 * break that handoff, so this constructs both from the one instance you provide.
 *
 * @example
 * const { tokenLoader, loginCallbackLoader } = createLoadersFromOrchestrator(tokenOrchestrator);
 */
export function createLoadersFromOrchestrator(orchestrator: AuthorizationCodeFlowOrchestrator): {
  tokenLoader: ReturnType<typeof createTokenLoader>;
  loginCallbackLoader: ReturnType<typeof createLoginCallbackLoader>;
} {
  return {
    tokenLoader: createTokenLoader(orchestrator),
    loginCallbackLoader: createLoginCallbackLoader(orchestrator),
  };
}

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

// Constructs the `FetchClient` used to call protected APIs. This is a data concern, not an auth
// one: `FetchClient` never authenticates, it only attaches (and refreshes) tokens that
// `authService` already knows how to obtain. Hence the dependency runs one way, data -> auth.
import { FetchClient } from '@okta/spa-platform/flows';
import type { TokenOrchestrator } from '@okta/spa-platform/flows';
import { orchestrator } from './authService';

// The cast works around an upstream typing regression in `@okta/auth-foundation` 0.9.0: its
// `EventEmitter` gained a `signals: Map<keyof Events, ...>` field, and `Map`'s key type is
// invariant, so no orchestrator that widens the event map is assignable to the base
// `TokenOrchestrator` that `FetchClient` asks for - including this SDK's own
// `AuthorizationCodeFlowOrchestrator`, which adds `login_prompt_required`. Remove once upstream
// accepts the subclass again (0.6.0 did, when `signals` did not exist).
export const fetchClient = new FetchClient(orchestrator as unknown as TokenOrchestrator);

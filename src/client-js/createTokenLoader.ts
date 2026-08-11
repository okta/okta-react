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

import type { Token, TokenOrchestrator } from '@okta/auth-foundation';
import type { AuthorizationCodeFlowOrchestrator } from '@okta/spa-platform';

/**
 * Wraps an {@link AuthorizationCodeFlowOrchestrator} in a React Router (v6.4+) loader-compatible function,
 * for consumers who want a raw {@link Token} (e.g. to attach an `Authorization` header themselves) rather
 * than a `fetchClient`-mediated `Response`.
 *
 * `orchestrator.getToken()` already resolves a matching credential, refreshes it if needed, or performs a
 * full re-authentication redirect if not - if a redirect occurs, the returned promise never resolves because
 * the page navigates away, same as {@link createFetchLoader}. The `401` throw below only covers the
 * (default-off, `avoidPrompting: true`) case where the orchestrator declines to redirect and returns `null`.
 */
export function createTokenLoader(
  orchestrator: AuthorizationCodeFlowOrchestrator,
  params?: TokenOrchestrator.AuthorizeParams,
) {
  return async (): Promise<Token> => {
    const token = await orchestrator.getToken(params);
    if (!token) {
      throw new Response('Unauthorized', { status: 401 });
    }
    return token;
  };
}

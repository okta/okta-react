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

/**
 * Wraps an {@link AuthorizationCodeFlowOrchestrator} in a React Router (v6.4+) loader-compatible function - the
 * loader-based replacement for the `<LoginCallback />` component. Runs on the OAuth redirect-callback route;
 * no rendered component is needed.
 *
 * `orchestrator.resumeFlow()` completes the authorization code exchange and stores the resulting credential
 * itself - this loader does no storage of its own, it just redirects once that's done.
 *
 * The `context` returned by `orchestrator.resumeFlow()` is whatever `meta` object was passed to `flow.start()`
 * (or the orchestrator's `login_prompt_required` listener) when the flow began - `originalUri` is a convention,
 * not a guarantee, so consumers who pass their own `meta` shape should read `context` themselves instead of
 * using this loader.
 *
 * Constructing the redirect `Response` directly (rather than importing `redirect()` from `react-router-dom`)
 * keeps this subpath's runtime code framework-agnostic - it needs no `react-router-dom` import at all, only
 * the ambient `Request`/`Response` globals.
 */
export function createLoginCallbackLoader(orchestrator: AuthorizationCodeFlowOrchestrator) {
  return async ({ request }: { request: Request }): Promise<Response> => {
    const context = await orchestrator.resumeFlow(request.url);
    const { originalUri } = context;

    return new Response(null, { status: 302, headers: { Location: originalUri ?? '/' } });
  };
}

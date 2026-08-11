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

// Imported from @okta/auth-foundation (not @okta/spa-platform, whose FetchClient re-export doesn't
// surface the inherited `fetch` method to the type checker) - spa-platform's concrete FetchClient
// instances are structurally assignable here since they extend this base class.
import type { FetchClient } from '@okta/auth-foundation';

export interface LoaderArgs {
  request: Request;
  params: Record<string, string | undefined>;
}

export type GetResource = (args: LoaderArgs) => string | URL | Request;

/**
 * Wraps a {@link FetchClient} in a React Router (v6.4+) loader-compatible function.
 *
 * `fetchClient.fetch()` already resolves a matching credential, refreshes it if needed, or performs a full
 * re-authentication redirect if not - this loader does no auth logic of its own, it just fetches and returns
 * the raw `Response`, which React Router auto-parses when read via `useLoaderData()`.
 */
export function createFetchLoader(
  fetchClient: FetchClient,
  getResource: GetResource,
  init?: RequestInit,
) {
  return async (args: LoaderArgs): Promise<Response> => {
    return fetchClient.fetch(getResource(args), init);
  };
}

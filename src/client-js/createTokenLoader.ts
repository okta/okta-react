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

import type { Token } from '@okta/auth-foundation';
import type { AuthorizationCodeFlowOrchestrator } from '@okta/spa-platform/flows';

/** The loader arguments React Router passes to a route's `loader`, narrowed to what this helper reads. */
export type LoaderArgs = { request: Request };

export type CreateTokenLoaderOptions = {
  /**
   * Derives the `originalUri` the user returns to after signing in. Defaults to the loader request's
   * path, query and hash.
   */
  getOriginalUri?: (request: Request) => string;
};

const defaultGetOriginalUri = (request: Request): string => {
  const { pathname, search, hash } = new URL(request.url);
  return pathname + search + hash;
};

/**
 * Binds an {@link AuthorizationCodeFlowOrchestrator} to a React Router (v6.4+) loader, for consumers who
 * want a raw {@link Token} (e.g. to attach an `Authorization` header themselves) rather than a
 * `fetchClient`-mediated `Response`.
 *
 * `orchestrator.getToken()` already resolves a matching credential, refreshes it if needed, or performs a
 * full re-authentication redirect if not - if a redirect occurs, the returned promise never resolves because
 * the page navigates away, same as {@link createFetchLoader}. The `401` throw below satisfies
 * `getToken()`'s `Token | null` return type; in practice the orchestrator returns a token or throws.
 *
 * The returned function takes React Router's loader arguments, so a route's `loader` forwards them. It is
 * not assigned directly: React Router's `LoaderFunction` declares a second `handlerCtx` parameter, which
 * `params` below would be checked against.
 *
 * @example
 * const tokenLoader = createTokenLoader(orchestrator);
 * // ...
 * loader: (args) => tokenLoader(args),
 *
 * `originalUri` is derived from the loader's `request`, which carries the route being navigated *to*. React
 * Router has not committed that URL to `window.location` while a loader runs, so the orchestrator's default
 * would capture the previous route and return the user there after signing in. Override the derivation with
 * `getOriginalUri` - to strip a base path, say - or per call via `params`:
 *
 * @example
 * const tokenLoader = createTokenLoader(orchestrator, {
 *   getOriginalUri: (request) => new URL(request.url).pathname.replace(/^\/app/, ''),
 * });
 * // ...
 * loader: (args) => tokenLoader(args, { scopes: ['openid', 'admin'] }),
 */
export function createTokenLoader(
  orchestrator: AuthorizationCodeFlowOrchestrator,
  options: CreateTokenLoaderOptions = {}
) {
  const getOriginalUri = options.getOriginalUri ?? defaultGetOriginalUri;

  return async (
    { request }: LoaderArgs,
    params?: AuthorizationCodeFlowOrchestrator.TokenParams
  ): Promise<Token> => {
    const token = await orchestrator.getToken({
      ...params,
      originalUri: params?.originalUri ?? getOriginalUri(request),
    });
    if (!token) {
      throw new Response('Unauthorized', { status: 401 });
    }
    return token;
  };
}

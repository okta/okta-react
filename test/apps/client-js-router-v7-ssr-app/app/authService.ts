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

// Constructs the sign-in/sign-out flows and the token orchestrator - everything that performs
// authentication. The `FetchClient` that *consumes* these tokens lives in `dataService.ts`.
//
// The flow and orchestrator exports live behind the `/flows` entry point - they depend on
// `@okta/oauth2-flows`, which the root entry point deliberately avoids so that it stays an
// optional dependency. `/flows` re-exports the root surface too, so one import covers both.
import type {
    AuthorizationCodeFlowOrchestrator,
    SessionLogoutFlow,
} from '@okta/spa-platform/flows';

type AuthService = {
    orchestrator: AuthorizationCodeFlowOrchestrator;
    signOutFlow: SessionLogoutFlow;
};

let authPromise: Promise<AuthService> | undefined;

// `@okta/spa-platform`'s entry points are barrel files: importing any export (e.g.
// `OAuth2Client`) loads the whole module graph, including `Credential`, whose module touches
// the browser-only `location` global on import. This file is imported on the server as well as
// in the browser, so the import is dynamic here. `createAuth()` runs only in the browser
// (clientLoader bodies, event handlers), never from module scope.
async function createAuth(): Promise<AuthService> {
    const {
        OAuth2Client,
        AuthorizationCodeFlow,
        SessionLogoutFlow,
        AuthorizationCodeFlowOrchestrator,
    } = await import('@okta/spa-platform/flows');

    const { ISSUER, CLIENT_ID } = process.env;
    const appOrigin = window.location.origin;

    const client = new OAuth2Client({
        issuer: ISSUER!,
        clientId: CLIENT_ID!,
        scopes: ['openid', 'profile', 'email'],
    });

    const signInFlow = new AuthorizationCodeFlow(client, {
        redirectUri: `${appOrigin}/login/callback`,
    });

    const signOutFlow = new SessionLogoutFlow(client, {
        logoutRedirectUri: `${appOrigin}/`,
    });

    // `emitBeforeRedirect: false` skips the `login_prompt_required` event - this sample has no
    // confirmation UI to gate the redirect on, so `getToken()` should redirect immediately.
    const orchestrator = new AuthorizationCodeFlowOrchestrator(signInFlow, {
        emitBeforeRedirect: false,
    });

    // If the user abandons a sign-in redirect (e.g. hits the browser back button on Okta's hosted
    // page before completing it) and the browser restores this page from the back/forward cache,
    // `signInFlow` comes back with `inProgress` still stuck `true` from the aborted attempt -
    // `start()`/`resume()` only ever reset it on completion or failure, neither of which runs for an
    // abandoned redirect. That stuck state makes every later `orchestrator.getToken()` call throw
    // `flow already in progress` immediately. `pageshow`'s `persisted` flag is the standard signal
    // for a bfcache restore, so reset here. Registered inside `createAuth()` rather than at module
    // scope because this module is also imported on the server, where `window` doesn't exist.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            signInFlow.reset();
        }
    });

    return { orchestrator, signOutFlow };
}

export function getAuth(): Promise<AuthService> {
    authPromise ??= createAuth();
    return authPromise;
}

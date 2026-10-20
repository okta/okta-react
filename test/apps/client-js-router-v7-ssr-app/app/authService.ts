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

import type {
    AuthorizationCodeFlowOrchestrator,
    SessionLogoutFlow,
} from '@okta/spa-platform/flows';

type AuthService = {
    orchestrator: AuthorizationCodeFlowOrchestrator;
    signOutFlow: SessionLogoutFlow;
};

let authPromise: Promise<AuthService> | undefined;

// Imported dynamically because this module is also loaded on the server, and
// `@okta/spa-platform`'s barrel touches the browser-only `location` global on import.
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

    // Skips the `login_prompt_required` event - there's no confirmation UI to gate the redirect on.
    const orchestrator = new AuthorizationCodeFlowOrchestrator(signInFlow, {
        emitBeforeRedirect: false,
    });

    // An abandoned sign-in redirect leaves `inProgress` stuck true, so every later `getToken()`
    // throws `flow already in progress`. Reset when the page is restored from the bfcache.
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

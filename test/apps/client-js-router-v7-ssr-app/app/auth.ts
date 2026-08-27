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

import type { AuthorizationCodeFlowOrchestrator, FetchClient, SessionLogoutFlow } from '@okta/spa-platform';

type Auth = {
    orchestrator: AuthorizationCodeFlowOrchestrator;
    signOutFlow: SessionLogoutFlow;
    fetchClient: FetchClient;
};

let authPromise: Promise<Auth> | undefined;

// `@okta/spa-platform`'s entry point is a single barrel file: importing any
// export from it (e.g. `OAuth2Client`) loads the whole module graph,
// including `Credential`, whose module touches the browser-only `location`
// global on import. This file is imported on the server as well as in the
// browser, so the import is dynamic here. `createAuth()` runs only in the
// browser (clientLoader bodies, event handlers), never from module scope.
async function createAuth(): Promise<Auth> {
    const {
        OAuth2Client,
        AuthorizationCodeFlow,
        SessionLogoutFlow,
        AuthorizationCodeFlowOrchestrator,
        FetchClient,
    } = await import('@okta/spa-platform');

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

    const orchestrator = new AuthorizationCodeFlowOrchestrator(signInFlow, {
        emitBeforeRedirect: false,
    });

    const fetchClient = new FetchClient(orchestrator);

    return { orchestrator, signOutFlow, fetchClient };
}

export function getAuth(): Promise<Auth> {
    authPromise ??= createAuth();
    return authPromise;
}

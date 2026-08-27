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

// `@okta/spa-platform`'s main entry is a single barrel file that re-exports
// `Credential` alongside `OAuth2Client` etc. Importing it at module scope
// (even just for `OAuth2Client`) forces that re-export to load too, and its
// module chain touches the browser-only `location` global as soon as it's
// loaded - which crashes under SSR, since this file is imported (via route
// modules) on the server as well as in the browser. So the import is done
// dynamically, inside this function, which must only ever be called from
// code that's guaranteed to run in the browser (clientLoader bodies, event
// handlers) - never from module scope.
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

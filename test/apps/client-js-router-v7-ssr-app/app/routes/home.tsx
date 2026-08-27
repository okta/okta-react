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

import { Link, useLoaderData } from 'react-router';
import { getAuth } from '../auth';

// `Credential` is imported dynamically because `@okta/spa-platform`'s entry
// point is a single barrel file: importing any export from it loads the
// whole module graph, including `Credential`'s own module, which touches the
// browser-only `location` global on import. This route module is also
// imported on the server, for its `HydrateFallback`/`Home` exports;
// `clientLoader` and `signOut` below only run in the browser.
export async function clientLoader() {
    // `getAuth()` constructs the `OAuth2Client` that `Credential.getDefault()` reads from.
    const [{ Credential }] = await Promise.all([import('@okta/spa-platform'), getAuth()]);
    const credential = await Credential.getDefault();
    return { hasCredential: credential !== null };
}
clientLoader.hydrate = true;

export function HydrateFallback() {
    return <p>Checking authentication…</p>;
}

export default function Home() {
    const { hasCredential } = useLoaderData<typeof clientLoader>();

    const signIn = async () => {
        const { orchestrator } = await getAuth();
        await orchestrator.getToken();
    };

    const signOut = async () => {
        const [{ Credential }, { signOutFlow }] = await Promise.all([import('@okta/spa-platform'), getAuth()]);
        const credential = await Credential.getDefault();
        const idToken = credential?.token.idToken?.toString();
        if (!credential || !idToken) {
            return;
        }
        await credential.remove();
        const url = await signOutFlow.start(idToken);
        window.location.assign(url);
    };

    return (
        <div>
            <h1>okta-react client-js + React Router v7 SSR sample</h1>
            {hasCredential ? (
                <button id="logout-button" onClick={signOut}>Sign out</button>
            ) : (
                <button id="login-button" onClick={signIn}>Sign in</button>
            )}
            <nav>
                <Link to="/protected">Protected</Link>
                {' | '}
                <Link to="/resource">Resource</Link>
            </nav>
        </div>
    );
}

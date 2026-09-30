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
import { createTokenLoader } from '@okta/okta-react/client-js';
import { getAuth } from '../auth';

export async function clientLoader() {
    const { orchestrator } = await getAuth();
    return createTokenLoader(orchestrator)();
}
clientLoader.hydrate = true;

export function HydrateFallback() {
    return <p>Checking authentication…</p>;
}

export default function Protected() {
    const token = useLoaderData<typeof clientLoader>();
    const claims = token.idToken?.claims;

    return (
        <div>
            <h1>Protected</h1>
            <p>Loaded via <code>createTokenLoader</code>.</p>
            <pre id="claims">{JSON.stringify(claims, null, 2)}</pre>
            <Link to="/">Home</Link>
        </div>
    );
}

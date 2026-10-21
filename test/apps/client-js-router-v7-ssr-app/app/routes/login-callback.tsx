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

import { createLoginCallbackLoader } from '@okta/okta-react/client-js';
import { getAuth } from '../authService';

export async function clientLoader({ request }: { request: Request }) {
    const { orchestrator } = await getAuth();
    return createLoginCallbackLoader(orchestrator)({ request });
}
clientLoader.hydrate = true;

// React Router resolves fallbacks by export name, so this must stay a named export.
export function HydrateFallback() {
    return <p>Checking authentication…</p>;
}

// `clientLoader` always redirects, so this renders only until the browser follows the 302.
export default function LoginCallback() {
    return <p>Signing in…</p>;
}

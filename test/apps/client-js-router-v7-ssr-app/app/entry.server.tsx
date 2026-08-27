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

import { PassThrough } from 'node:stream';
import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { createReadableStreamFromReadable } from '@react-router/node';
import { renderToPipeableStream } from 'react-dom/server';

// `renderToString` can't render a Suspense boundary that's still pending, and
// routes with `clientLoader.hydrate = true` (like `home.tsx`, `protected.tsx`,
// etc.) render inside exactly that kind of boundary so their `HydrateFallback`
// can be shown. `renderToPipeableStream` is the streaming renderer that
// supports it.
export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
) {
    return new Promise<Response>((resolve, reject) => {
        let shellRendered = false;
        const { pipe, abort } = renderToPipeableStream(
            <ServerRouter context={routerContext} url={request.url} />,
            {
                onShellReady() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);
                    responseHeaders.set('Content-Type', 'text/html');
                    resolve(new Response(stream, {
                        status: responseStatusCode,
                        headers: responseHeaders,
                    }));
                    pipe(body);
                },
                onShellError(error) {
                    reject(error);
                },
                onError(error) {
                    responseStatusCode = 500;
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            },
        );
        setTimeout(abort, 5000);
    });
}

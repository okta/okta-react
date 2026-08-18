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

import { TextDecoder, TextEncoder } from 'util';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
import { MessageChannel, MessagePort } from 'worker_threads';
import { performance } from 'perf_hooks';

// jsdom (testEnvironment) sandboxes its own global scope, hiding the Node-native web APIs that
// undici's real Fetch implementation needs at import time - unlike browser-oriented ponyfills
// (e.g. whatwg-fetch), undici's Response.body is a genuine ReadableStream, which react-router-dom's
// `isResponse()` duck-type check (and its auto JSON-parsing/redirect detection) requires.
Object.assign(global, {
  TextDecoder,
  TextEncoder,
  ReadableStream,
  TransformStream,
  WritableStream,
  MessageChannel,
  MessagePort,
  performance,
});

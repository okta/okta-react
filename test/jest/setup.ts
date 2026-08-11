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

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { fetch, Headers, Request, Response } from 'undici';

Enzyme.configure({ adapter: new Adapter() });

// jsdom (testEnvironment) doesn't implement the Fetch API - React Router v6.4+'s data router
// internals (createMemoryRouter et al.) rely on the global Request/Response/fetch.
Object.assign(global, { fetch, Headers, Request, Response });

// eslint-disable-next-line @typescript-eslint/no-empty-function
global.console.warn = function() {};

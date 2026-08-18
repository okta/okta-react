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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createLoadersFromOrchestrator } from '../../../src/client-js/createLoadersFromOrchestrator';

describe('createLoadersFromOrchestrator', () => {
  it('binds both loaders to the same orchestrator instance', async () => {
    const token = { accessToken: 'abc123' };
    const orchestrator = {
      getToken: jest.fn().mockResolvedValue(token),
      resumeFlow: jest.fn().mockResolvedValue({ originalUri: '/protected' }),
    };

    const { tokenLoader, loginCallbackLoader } = createLoadersFromOrchestrator(orchestrator as any);

    await expect(tokenLoader()).resolves.toBe(token);
    expect(orchestrator.getToken).toHaveBeenCalledWith(undefined);

    const response = await loginCallbackLoader({ request: new Request('https://example.com/login/callback') });
    expect(orchestrator.resumeFlow).toHaveBeenCalledWith('https://example.com/login/callback');
    expect(response.headers.get('Location')).toBe('/protected');
  });
});

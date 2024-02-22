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

import { AuthState, OktaAuth } from '@okta/okta-auth-js';
import { getRelativeUri, waitForAuthenticated } from '@okta/okta-react';

describe('utils', () => {
  describe('getRelativeUri', () => {
    const expectedList = [
      ['', '/'],
      [`${location.origin}/protected`, '/protected'],
      [`${location.origin}/#/protected`, '/protected'],
      [`${location.origin}/#protected`, 'protected'],
      [`${location.origin}/aaa/#/protected`, '/aaa/#/protected'],
      ['https://another-origin.com/protected', 'https://another-origin.com/protected'],
    ];
    for (const [url, expected] of expectedList) {
      it(`( ${url} )`, () => {
        expect(getRelativeUri(url)).toBe(expected);
      });
    }
  });

  describe('waitForAuthenticated', () => {
    let oktaAuth: OktaAuth;
    let subscribers: Array<(authState: AuthState) => void> = [];
    const notifySubscribers = (authState: AuthState) => {
      for (const subscriber of subscribers) {
        subscriber.call(null, authState);
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      subscribers = [];
      oktaAuth = {
        options: {},
        authStateManager: {
          getAuthState: jest.fn().mockImplementation(() => null),
          updateAuthState: jest.fn(),
          subscribe: jest.fn().mockImplementation((handler) => {
            subscribers.push(handler);
          }),
          unsubscribe: jest.fn().mockImplementation((handler) => {
            if (handler) {
              subscribers = subscribers.filter(h => h!== handler);
            } else {
              subscribers = [];
            }
          }),
        },
      } as any;
      jest.spyOn(oktaAuth.authStateManager, 'subscribe');
      jest.spyOn(oktaAuth.authStateManager, 'unsubscribe');
    });

    it('resolves when auth state has property isAuthenticated == true', async () => {
      let isResolved = false;
      waitForAuthenticated(oktaAuth).then(() => {
        isResolved = true;
      });
      await Promise.resolve();
      expect(isResolved).toBe(false);
      expect(oktaAuth.authStateManager.subscribe).toHaveBeenCalledTimes(1);
      expect(oktaAuth.authStateManager.unsubscribe).toHaveBeenCalledTimes(0);

      notifySubscribers({ isAuthenticated: false });
      await Promise.resolve();
      expect(isResolved).toBe(false);

      notifySubscribers({ isAuthenticated: true });
      await Promise.resolve();
      expect(isResolved).toBe(true);
      expect(oktaAuth.authStateManager.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});

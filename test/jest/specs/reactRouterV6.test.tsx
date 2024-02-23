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

import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from 'react-dom';
import { OktaContext } from '@okta/okta-react';
import { SecureRoute } from '@okta/okta-react/react-router-5';
import ErrorBoundary from '../support/ErrorBoundary';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useMatch: jest.fn()
}));

describe('react-router-dom v6', () => {
  let oktaAuth: any;
  let authState: any;

  beforeEach(() => {
    authState = null;
    oktaAuth = {
      options: {},
      authStateManager: {
        getAuthState: jest.fn().mockImplementation(() => authState),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        updateAuthState: jest.fn(),
      },
      isLoginRedirect: jest.fn().mockImplementation(() => false),
      handleLoginRedirect: jest.fn(),
      signInWithRedirect: jest.fn(),
      setOriginalUri: jest.fn(),
      start: jest.fn(),
    };
  });

  describe('<SecureRoute />', () => {
    let originalConsole: any;
    beforeEach(() => {
      // prevents logging error to console
      originalConsole = { ...global.console };
      global.console.error = jest.fn();
    });
    afterEach(() => {
      global.console.error = originalConsole.error;
    });

    it('throws unsupported error', async () => {
      const container = document.createElement('div');
      await act(async () => {
        render(
          <OktaContext.Provider value={{
            oktaAuth: oktaAuth,
            authState
          }}>
            <ErrorBoundary>
              <SecureRoute path="/" />
            </ErrorBoundary>
          </OktaContext.Provider>,
          container
        );
      });
      expect(container.innerHTML).toBe('<p>AuthSdkError: Unsupported: SecureRoute only works with react-router-dom v5 or any router library with compatible APIs. Please use Route instead and wrap your component with AuthRequired.</p>');
    });
  });
});
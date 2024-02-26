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
import { OktaAuth, AuthState } from '@okta/okta-auth-js';
import { AuthRequired } from '@okta/okta-react/react-router-6';
import { MemoryRouter } from 'react-router-dom6';
import { Security } from '@okta/okta-react';
import { SecurityProps } from '../../src/Security';
import ErrorBoundary from './support/ErrorBoundary';

jest.mock('react-router-dom', () => jest.requireActual('react-router-dom'));

describe('<AuthRequired />', () => {
  describe('with react-router-dom v5', () => {
    let oktaAuth: OktaAuth;
    let authState: AuthState | null;
    let mockProps: SecurityProps;
    const restoreOriginalUri = async (_: OktaAuth, url: string) => {
      location.href = url;
    };

    beforeEach(() => {
      // prevents logging error to console
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      console.error = (()=>{});   // noop

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
      } as any as OktaAuth;
      mockProps = {
        oktaAuth, 
        restoreOriginalUri
      };
    });
    
    it('throws unsupported error', async () => {
      authState = {
        isAuthenticated: true
      };
      const container = document.createElement('div');
      await act(async () => {
        render(
          <ErrorBoundary>
            <MemoryRouter>
              <Security {...mockProps}>
                <AuthRequired />
              </Security>
            </MemoryRouter>
          </ErrorBoundary>,
          container
        );
      });
      expect(container.innerHTML).toBe('<p>AuthSdkError: Unsupported: AuthRequired only works with react-router-dom v6 or any router library with compatible APIs. See examples under the "samples" folder for how to implement your own custom SecureRoute Component.</p>');
    })
  });
});

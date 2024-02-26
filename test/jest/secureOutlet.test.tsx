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

import * as React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { OktaAuth, AuthState } from '@okta/okta-auth-js';
import { render, unmountComponentAtNode } from 'react-dom';
import { OktaContext, Security } from '@okta/okta-react';
import { SecureOutlet } from '@okta/okta-react/react-router-6';
import { MemoryRouter, Route, Routes } from 'react-router-dom6';
import { SecurityProps } from '../../src/Security';
import { ErrorComponent } from '../../src/OktaError';

jest.mock('react-router-dom', () => jest.requireActual('react-router-dom6'));

describe('<SecureOutlet />', () => {
  let oktaAuth: OktaAuth;
  let authState: AuthState | null;
  let mockProps: SecurityProps;
  const restoreOriginalUri = async (_: OktaAuth, url: string) => {
    location.href = url;
  };

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
    } as any as OktaAuth;
    mockProps = {
      oktaAuth, 
      restoreOriginalUri
    };
  });

  describe('With changing authState', () => {
    let emitAuthState: () => void | undefined;

    beforeEach(() => {
      oktaAuth.authStateManager.subscribe = (cb) => {
        emitAuthState = () => {
          act(cb.bind(null, authState as AuthState));
        };
      };
    });

    function updateAuthState(newProps: Record<string, unknown> | null = {}) {
      authState = Object.assign({}, authState || {}, newProps);
      emitAuthState();
    }

    it('calls login() only once until user is authenticated', () => {
      authState = {
        isAuthenticated: false
      }
  
      mount(
        <Security {...mockProps}>
          <SecureOutlet />
        </Security>
      );
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      (oktaAuth.signInWithRedirect as jest.Mock).mockClear();

      updateAuthState(null);
      expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();

      updateAuthState({});
      expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();

      updateAuthState({ isAuthenticated: true });
      expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();

      // If the state returns to unauthenticated, the SecureOutlet should still work
      updateAuthState({ isAuthenticated: false });
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAuthenticated: true', () => {
    beforeEach(() => {
      authState = {
        isAuthenticated: true
      };
    });

    it('will render wrapped route component', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <Route path='/' element={<SecureOutlet />}>
                <Route path='/' element={<MyComponent />} />
              </Route>
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });
  });
  
  describe('isAuthenticated: false', () => {
    beforeEach(() => {
      authState = {
        isAuthenticated: false
      };
    });

    it('will not render wrapped route component', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <Route path='/' element={<SecureOutlet />}>
                <Route path='/' element={<MyComponent />} />
              </Route>
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    describe('authState is not null', () => {
      beforeEach(() => {
        authState = {};
      });

      it('calls signInWithRedirect() if onAuthRequired is not provided', () => {
        mount(
          <Security {...mockProps}>
            <SecureOutlet />
          </Security>
        );
        expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
      });
  
      it('calls onAuthRequired if provided from Security', () => {
        const onAuthRequired = jest.fn();
        mount(
          <Security {...mockProps} onAuthRequired={onAuthRequired}>
            <SecureOutlet />
          </Security>
        );
        expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
        expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
        expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth);
      });

      it('calls onAuthRequired from SecureOutlet if provide from both Security and SecureOutlet', () => {
        const onAuthRequired1 = jest.fn();
        const onAuthRequired2 = jest.fn();
        mount(
          <Security {...mockProps} onAuthRequired={onAuthRequired1}>
            <SecureOutlet onAuthRequired={onAuthRequired2} />
          </Security>
        );
        expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
        expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
        expect(onAuthRequired1).not.toHaveBeenCalled();
        expect(onAuthRequired2).toHaveBeenCalledWith(oktaAuth);
      });
    });

    describe('authState is null', () => {
      beforeEach(() => {
        authState = null;
      });

      it('does not call signInWithRedirect()', () => {
        mount(
          <Security {...mockProps}>
            <SecureOutlet />
          </Security>
        );
        expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    let container: HTMLElement | null = null;
    beforeEach(() => {
      // setup a DOM element as a render target
      container = document.createElement('div');
      document.body.appendChild(container);
      
      authState = {
        isAuthenticated: false
      };

      oktaAuth.setOriginalUri = jest.fn().mockImplementation(() => {
        throw new Error(`DOMException: Failed to read the 'sessionStorage' property from 'Window': Access is denied for this document.`);
      });
    });

    afterEach(() => {
      // cleanup on exiting
      unmountComponentAtNode(container as Element);
      container?.remove();
      container = null;
    });

    it('shows error with default OktaError component', async () => {
      await act(async () => {
        render(
          <OktaContext.Provider value={{
            oktaAuth: oktaAuth,
            authState
          }}>
            <SecureOutlet />
          </OktaContext.Provider>,
          container
        );
      });
      expect(container?.innerHTML).toBe('<p>Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</p>');
    });

    it('shows error with provided custom error component', async () => {
      const CustomErrorComponent: ErrorComponent = ({ error }) => {
        return <div>Custom Error: {error.message}</div>;
      };
      await act(async () => {
        render(
          <OktaContext.Provider value={{
            oktaAuth: oktaAuth,
            authState
          }}>
            <SecureOutlet errorComponent={CustomErrorComponent} />
          </OktaContext.Provider>,
          container
        );
      });
      expect(container?.innerHTML).toBe('<div>Custom Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</div>');
    });
  });

  describe('shows loading', () => {
    let container: HTMLElement | null = null;
    beforeEach(() => {
      // setup a DOM element as a render target
      container = document.createElement('div');
      document.body.appendChild(container);
      
      authState = {
        isAuthenticated: false
      };
    });

    afterEach(() => {
      // cleanup on exiting
      unmountComponentAtNode(container as Element);
      container?.remove();
      container = null;
    });

    it('does not render loading by default', () => { 
      const wrapper = mount(
        <Security {...mockProps}>
          <SecureOutlet />
        </Security>
      );
      expect(wrapper.text()).toBe('');
    });

    it('custom loading element can be passed to render during loading', () => {
      const MyLoadingElement = (<p>loading...</p>);

      const wrapper = mount(
        <Security {...mockProps}>
          <SecureOutlet loadingElement={MyLoadingElement} />
        </Security>
      );
      expect(wrapper.text()).toBe('loading...');
    });

    it('does not render loading element on error', async () => {
      oktaAuth.setOriginalUri = jest.fn().mockImplementation(() => {
        throw new Error('oh drat!');
      });
      const MyLoadingElement = (<p>loading...</p>);

      await act(async () => {
        render(
          <Security {...mockProps}>
            <SecureOutlet loadingElement={MyLoadingElement} />
          </Security>,
          container
        );
      });
      expect(container?.innerHTML).toBe('<p>Error: oh drat!</p>');
    });
  });

});
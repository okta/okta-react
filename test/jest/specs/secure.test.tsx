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
import { OktaContext, Security, Secure, ErrorComponent } from '@okta/okta-react';
import { SecurityProps } from '../../../src/context/Security';
import ErrorBoundary from '../support/ErrorBoundary';

describe('<Secure />', () => {
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

  describe('without <Security /> provider', () => {
    let originalConsole: any;
    beforeEach(() => {
      // prevents logging error to console
      originalConsole = { ...global.console };
      global.console.error = jest.fn();
    });
    afterEach(() => {
      global.console.error = originalConsole.error;
    });

    it('throws an error', async () => {
      const container = document.createElement('div');
      await act(async () => {
        render(
          <ErrorBoundary>
            <Secure>{"secure!"}</Secure>
          </ErrorBoundary>,
          container
        );
      });
      expect(container.innerHTML).toContain('Okta context is not provided!');
    });
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
          <Secure>{"secure!"}</Secure>
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

      // If the state returns to unauthenticated, the Secure should still work
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

    it('will render wrapped component', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <Security {...mockProps}>
          <Secure><MyComponent /></Secure>
        </Security>
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

    it('will not render wrapped component', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <Security {...mockProps}>
          <Secure>
            <MyComponent/>
          </Secure>
        </Security>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    describe('authState is not null', () => {
      beforeEach(() => {
        authState = {};
      });

      describe('requiresAuth=true or undefined', () => {
        it('calls signInWithRedirect() if onAuthRequired is not provided', () => {
          mount(
            <Security {...mockProps}>
              <Secure>{"secure!"}</Secure>
            </Security>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
        });
  
        it('calls onAuthRequired if provided from Security', () => {
          const onAuthRequired = jest.fn();
          mount(
            <Security {...mockProps} onAuthRequired={onAuthRequired}>
              <Secure>{"secure!"}</Secure>
            </Security>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
          expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth);
        });

        it('calls onAuthRequired from Secure if provide from both Security and Secure', () => {
          const onAuthRequired1 = jest.fn();
          const onAuthRequired2 = jest.fn();
          mount(
            <Security {...mockProps} onAuthRequired={onAuthRequired1}>
              <Secure onAuthRequired={onAuthRequired2}>{"secure!"}</Secure>
            </Security>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
          expect(onAuthRequired1).not.toHaveBeenCalled();
          expect(onAuthRequired2).toHaveBeenCalledWith(oktaAuth);
        });
      });

      describe('requiresAuth = false', () => {
        it('does not call signInWithRedirect()', () => {
          mount(
            <Security {...mockProps}>
              <Secure requiresAuth={false}>{"secure!"}</Secure>
            </Security>
          );
          expect(oktaAuth.setOriginalUri).not.toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
        });
      });
    });

    describe('authState is null', () => {
      beforeEach(() => {
        authState = null;
      });

      it('does not call signInWithRedirect()', () => {
        mount(
          <Security {...mockProps}>
            <Secure>{"secure!"}</Secure>
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
            <Secure>{"secure!"}</Secure>
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
            <Secure errorComponent={CustomErrorComponent}>{"secure!"}</Secure>
          </OktaContext.Provider>,
          container
        );
      });
      expect(container?.innerHTML).toBe('<div>Custom Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</div>');
    });

    it('uses errorComponent provided from Security', async () => {
      const SecurityErrorComponent: ErrorComponent = ({ error }) => {
        return <div>Security Error: {error.message}</div>;
      };
      await act(async () => {
        render(
          <OktaContext.Provider value={{
            oktaAuth: oktaAuth,
            authState,
            errorComponent: SecurityErrorComponent
          }}>
            <Secure>{"secure!"}</Secure>
          </OktaContext.Provider>,
          container
        );
      });
      expect(container?.innerHTML).toBe('<div>Security Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</div>');
    });

    it('uses errorComponent prop from Secure if provided from both Secure and Security', async () => {
      const SecurityErrorComponent: ErrorComponent = ({ error }) => {
        return <div>Security Error: {error.message}</div>;
      };
      const SecureErrorComponent: ErrorComponent = ({ error }) => {
        return <div>Secure Error: {error.message}</div>;
      };
      await act(async () => {
        render(
          <OktaContext.Provider value={{
            oktaAuth: oktaAuth,
            authState,
            errorComponent: SecurityErrorComponent
          }}>
            <Secure errorComponent={SecureErrorComponent}>{"secure!"}</Secure>
          </OktaContext.Provider>,
          container
        );
      });
      expect(container?.innerHTML).toBe('<div>Secure Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</div>');
    });
  });

  describe('Shows loading', () => {
    beforeEach(() => {
      authState = {
        isAuthenticated: false
      };
    });

    it('does not render loading by default', () => { 
      const wrapper = mount(
        <Security {...mockProps}>
          <Secure>{"secure!"}</Secure>
        </Security>
      );
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toBe('');
    });

    it('custom loading element can be passed to render during loading', () => {
      const MyLoadingElement = (<p>Loading...</p>);

      const wrapper = mount(
        <Security {...mockProps}>
          <Secure loadingElement={MyLoadingElement}>{"secure!"}</Secure>
        </Security>
      );
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toBe('Loading...');
    });

    it('uses loadingElement provided from Security', () => {
      const SecurityLoadingElement = (<p>Loading...</p>);

      const wrapper = mount(
        <Security {...mockProps} loadingElement={SecurityLoadingElement}>
          <Secure>{"secure!"}</Secure>
        </Security>
      );
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toBe('Loading...');
    });

    it('uses loadingElement prop from Secure if provided from both Secure and Security', () => {
      const SecurityLoadingElement = (<p>Loading...</p>);
      const SecureLoadingElement = (<p>Redirecting to sign-in...</p>);

      const wrapper = mount(
        <Security {...mockProps} loadingElement={SecurityLoadingElement}>
          <Secure loadingElement={SecureLoadingElement}>{"secure!"}</Secure>
        </Security>
      );
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toBe('Redirecting to sign-in...');
    });
  });

});

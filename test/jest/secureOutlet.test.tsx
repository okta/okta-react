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

jest.mock('react-router-dom', () => jest.requireActual('react-router-dom-v6'));

import * as React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { render, unmountComponentAtNode } from 'react-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SecureOutlet from '../../src/SecureOutlet';
import Security from '../../src/Security';
import OktaContext from '../../src/OktaContext';

describe('<SecureOutlet />', () => {
  let oktaAuth;
  let authState;
  let mockProps;
  const restoreOriginalUri = async (_, url) => {
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
    };
    mockProps = {
      oktaAuth,
      restoreOriginalUri
    };
  });

  describe('With changing authState', () => {
    let emitAuthState;

    beforeEach(() => {
      oktaAuth.authStateManager.subscribe = (cb) => {
        emitAuthState = () => {
          act(cb.bind(null, authState));
        };
      };
    });

    function updateAuthState(newProps = {}) {
      authState = Object.assign({}, authState || {}, newProps);
      emitAuthState();
    }

    it('calls login() only once until user is authenticated', () => {
      authState = {
        isAuthenticated: false
      };

      mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <Route path="/" element={<SecureOutlet />} />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      oktaAuth.signInWithRedirect.mockClear();

      updateAuthState(null);
      expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();

      updateAuthState({});
      expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();

      updateAuthState({ isAuthenticated: true });
      expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();

      // If the state returns to unauthenticated, the secure outlet should still work
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

    it('will render nested route content via Outlet', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter initialEntries={['/']}>
          <Security {...mockProps}>
            <Routes>
              <Route path="/" element={<SecureOutlet />}>
                <Route index element={<MyComponent />} />
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

    it('will not render nested route content', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter initialEntries={['/']}>
          <Security {...mockProps}>
            <Routes>
              <Route path="/" element={<SecureOutlet />}>
                <Route index element={<MyComponent />} />
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

      it('calls signInWithRedirect()', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <Route path="/" element={<SecureOutlet />} />
              </Routes>
            </Security>
          </MemoryRouter>
        );
        expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
      });

      it('calls onAuthRequired if provided from Security', () => {
        const onAuthRequired = jest.fn();
        mount(
          <MemoryRouter>
            <Security {...mockProps} onAuthRequired={onAuthRequired}>
              <Routes>
                <Route path="/" element={<SecureOutlet />} />
              </Routes>
            </Security>
          </MemoryRouter>
        );
        expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
        expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
        expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth);
      });

      it('calls onAuthRequired from SecureOutlet if provided from both Security and SecureOutlet', () => {
        const onAuthRequired1 = jest.fn();
        const onAuthRequired2 = jest.fn();
        mount(
          <MemoryRouter>
            <Security {...mockProps} onAuthRequired={onAuthRequired1}>
              <Routes>
                <Route path="/" element={<SecureOutlet onAuthRequired={onAuthRequired2} />} />
              </Routes>
            </Security>
          </MemoryRouter>
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
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <Route path="/" element={<SecureOutlet />} />
              </Routes>
            </Security>
          </MemoryRouter>
        );
        expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
      });
    });
  });

  describe('loadingElement', () => {
    let container = null;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
      authState = {
        isAuthenticated: false
      };
    });

    afterEach(() => {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    });

    it('renders nothing by default', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <Route path="/" element={<SecureOutlet />} />
              </Routes>
            </Security>
          </MemoryRouter>,
          container
        );
      });
      expect(container.innerHTML).toBe('');
    });

    it('renders a custom loadingElement', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <Route path="/" element={<SecureOutlet loadingElement={<div>Loading...</div>} />} />
              </Routes>
            </Security>
          </MemoryRouter>,
          container
        );
      });
      expect(container.innerHTML).toBe('<div>Loading...</div>');
    });
  });

  describe('Error handling', () => {
    let container = null;
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
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    });

    it('shows error with default OktaError component', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <OktaContext.Provider value={{
              oktaAuth: oktaAuth,
              authState
            }}>
              <SecureOutlet />
            </OktaContext.Provider>
          </MemoryRouter>,
          container
        );
      });
      expect(container.innerHTML).toBe('<p>Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</p>');
    });

    it('shows error with provided custom error component', async () => {
      const CustomErrorComponent = ({ error }) => {
        return <div>Custom Error: {error.message}</div>;
      };
      await act(async () => {
        render(
          <MemoryRouter>
            <OktaContext.Provider value={{
              oktaAuth: oktaAuth,
              authState
            }}>
              <SecureOutlet errorComponent={CustomErrorComponent} />
            </OktaContext.Provider>
          </MemoryRouter>,
          container
        );
      });
      expect(container.innerHTML).toBe('<div>Custom Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</div>');
    });
  });
});

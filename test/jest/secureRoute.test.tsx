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
import { render, unmountComponentAtNode } from 'react-dom';
import { MemoryRouter, Route, RouteProps } from 'react-router-dom';
import SecureRoute from '../../src/containers/SecureRoute';
import Security from '../../src/context/Security';
import OktaContext from '../../src/context';

jest.mock('@okta/okta-react', () => jest.requireActual('../../src'));

describe('<SecureRoute />', () => {
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
      }
  
      mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute path="/" />
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

      // If the state returns to unauthenticated, the secure route should still work
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

    it('will render wrapped component using "component"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('will render wrapped component using "render"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              render={ () => <MyComponent/> }
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('will render wrapped component as a child', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute>
              <MyComponent/>
            </SecureRoute>
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

    it('will not render wrapped component using "component"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    it('will not render wrapped component using "render"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              render={ () => <MyComponent/> }
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    it('will not render wrapped component with children', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute>
              <MyComponent/>
            </SecureRoute>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    describe('authState is not null', () => {

      beforeEach(() => {
        authState = {};
      });

      describe('route matches', () => {
        it('calls signInWithRedirect() if route matches', () => {
          mount(
            <MemoryRouter>
              <Security {...mockProps}>
                <SecureRoute path="/" />
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
                <SecureRoute path="/" />
              </Security>
            </MemoryRouter>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
          expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth);
        });

        it('calls onAuthRequired from SecureRoute if provide from both Security and SecureRoute', () => {
          const onAuthRequired1 = jest.fn();
          const onAuthRequired2 = jest.fn();
          mount(
            <MemoryRouter>
              <Security {...mockProps} onAuthRequired={onAuthRequired1}>
                <SecureRoute path="/" onAuthRequired={onAuthRequired2} />
              </Security>
            </MemoryRouter>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
          expect(onAuthRequired1).not.toHaveBeenCalled();
          expect(onAuthRequired2).toHaveBeenCalledWith(oktaAuth);
        });
      });

      describe('route does not match', () => {
        it('does not call signInWithRedirect()', () => {
          mount(
            <MemoryRouter>
              <Security {...mockProps}>
                <SecureRoute path="/other" />
              </Security>
            </MemoryRouter>
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
          <MemoryRouter>
            <Security {...mockProps}>
              <SecureRoute />
            </Security>
          </MemoryRouter>
        );
        expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
      });
    });
  });

  describe('when authenticated', () => { 
    const MyComponent = function() { return <div>hello world</div>; };
    beforeEach(() => {
      authState = {
        isAuthenticated: true
      };
    });

    it('should accept a "path" prop and render a component', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(SecureRoute).props().path).toBe('/');
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept an "exact" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              exact={true}
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      const props: RouteProps = secureRoute.find(Route).props();
      expect(props.exact).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept a "strict" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              strict={true}
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      const props: RouteProps = secureRoute.find(Route).props();
      expect(props.strict).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept a "sensitive" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              sensitive={true}
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      const props: RouteProps = secureRoute.find(Route).props();
      expect(props.sensitive).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should pass react-router props to an component', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.history ? 'has history' : 'lacks history'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has history</div>');
    });

    it('should pass react-router props to a render call', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.history ? 'has history' : 'lacks history'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              render = {props => <MyComponent {...props} />}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has history</div>');
    });

    it('should pass props using the "render" prop', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.someProp ? 'has someProp' : 'lacks someProp'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              render={ () => <MyComponent someProp={true}/> }
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has someProp</div>');
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
              <SecureRoute path="/" />
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
              <SecureRoute path="/" errorComponent={CustomErrorComponent} />
            </OktaContext.Provider>
          </MemoryRouter>,
          container
        );
      });
      expect(container.innerHTML).toBe('<div>Custom Error: DOMException: Failed to read the \'sessionStorage\' property from \'Window\': Access is denied for this document.</div>');
    });
  });
});

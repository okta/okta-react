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
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SecureRoute from '../../src/SecureRoute';
import Security from '../../src/Security';

describe('<SecureRoute />', () => {
  let oktaAuth;
  let authState;
  let mockProps;

  beforeEach(() => {
    authState = {
      isPending: true
    };
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
      setOriginalUri: jest.fn()
    };
    mockProps = { oktaAuth };
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
      authState = Object.assign({}, authState, newProps);
      emitAuthState();
    }

    it('calls login() only once until user is authenticated', () => {
      authState.isAuthenticated = false;
      authState.isPending = false;
  
      mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute path="/" />
          </Security>
        </MemoryRouter>
      );
      expect(oktaAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      oktaAuth.signInWithRedirect.mockClear();

      updateAuthState({ isPending: true });
      expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();

      updateAuthState({ isPending: false });
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
      authState.isAuthenticated = true;
      authState.isPending = false;
    });

    it('will render wrapped component using "element"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                element={<MyComponent />}
              />
            </Routes>
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
            <Routes>
              <SecureRoute>
                <MyComponent/>
              </SecureRoute>
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });
  });

  describe('isAuthenticated: false', () => {

    beforeEach(() => {
      authState.isAuthenticated = false;
      authState.isPending = false;
    });

    it('will not render wrapped component using "element"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                element={<MyComponent />}
              />
            </Routes>
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
             <Routes>
              <SecureRoute>
                <MyComponent/>
              </SecureRoute>
             </Routes>
           </Security>
         </MemoryRouter>
       );
       expect(wrapper.find(MyComponent).length).toBe(0);
    });

    describe('isPending: false', () => {

      beforeEach(() => {
        authState.isPending = false;
      });

      describe('route matches', () => {
        it('calls signInWithRedirect() if route matches', () => {
          mount(
            <MemoryRouter>
              <Security {...mockProps}>
                <Routes>
                  <SecureRoute path="/" />
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
                  <SecureRoute path="/" />
                </Routes>
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
                <Routes>
                  <SecureRoute path="/" onAuthRequired={onAuthRequired2} />
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

      describe('route does not match', () => {
        it('does not call signInWithRedirect()', () => {
          mount(
            <MemoryRouter>
              <Security {...mockProps}>
                <Routes>
                  <SecureRoute path="/other" />
                </Routes>
              </Security>
            </MemoryRouter>
          );
          expect(oktaAuth.setOriginalUri).not.toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
        });
      });
    });

    describe('isPending: true', () => {

      beforeEach(() => {
        authState.isPending = true;
      });

      it('does not call signInWithRedirect()', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <Routes>
                <SecureRoute />
              </Routes>
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
      authState.isPending = false;
      authState.isAuthenticated = true;
    });

    it('should accept a "path" prop and render a component', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                path='/'
                element={<MyComponent />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(SecureRoute).props().path).toBe('/');
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept a "caseSensitive" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                caseSensitive={true}
                path='/'
                element={<MyComponent />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      expect(secureRoute.find(Route).props().caseSensitive).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should pass props using the "element" prop', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.someProp ? 'has someProp' : 'lacks someProp'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <Routes>
              <SecureRoute
                path='/'
                element={<MyComponent someProp={true} />}
              />
            </Routes>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has someProp</div>');
    });

  });
});

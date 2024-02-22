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

import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { AuthState } from '@okta/okta-auth-js';
import ErrorBoundary from '../support/ErrorBoundary';
import { delay } from '../support/utils';

/* Forces Jest to use same version of React to enable fresh module state via isolateModulesAsync() call in beforeEach().
Otherwise, React raises "Invalid hook call" error because of multiple copies of React, see: https://github.com/jestjs/jest/issues/11471#issuecomment-851266333 */
jest.mock('react', () => jest.requireActual('react'));

describe('<LoginCallback />', () => {
  let container: HTMLElement | null = null;
  let wrapper: ReactWrapper | null = null;
  let isLoginRedirect = false;
  let oktaAuth: any;
  let authState: any;
  let mockProps: any;
  let Security: any;
  let LoginCallback: any;
  let subscribers: Array<(authState: AuthState) => void> = [];
  const restoreOriginalUri = async (_: any, url: string) => {
    location.href = url;
  };
  const notifySubscribers = (authState: AuthState) => {
    for (const subscriber of subscribers) {
      subscriber.call(null, authState);
    }
  };

  beforeEach(async () => {
    isLoginRedirect = true;
    authState = null;
    oktaAuth = {
      options: {},
      authStateManager: {
        getAuthState: jest.fn().mockImplementation(() => authState),
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
        updateAuthState: jest.fn(),
      },
      isLoginRedirect: jest.fn().mockImplementation(() => isLoginRedirect),
      handleLoginRedirect: jest.fn().mockImplementation( () => Promise.resolve() ),
      start: jest.fn(),
      stop: jest.fn(),
      idx: {
        isInteractionRequired: jest.fn().mockImplementation( () => false ),
      }
    };
    mockProps = {
      oktaAuth, 
      restoreOriginalUri
    };
    // Dynamically import Security and LoginCallback before each test to refresh the modules' states
    // Specifically used to reset the global handledRedirect variable in LoginCallback.tsx between tests
    await jest.isolateModulesAsync(async () => {
      Security = (await import('../../../src/context/Security')).default
      LoginCallback = (await import('../../../src/containers/LoginCallback')).default
    });
    jest.useFakeTimers();
    wrapper = null;
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    jest.useRealTimers();
    if (wrapper) {
      wrapper.unmount();
    }
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    }
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
            <LoginCallback />
          </ErrorBoundary>,
          container
        );
      });
      expect(container.innerHTML).toContain('Okta context is not provided!');
    });
  });

  it('renders the component', async () => {
    const wrapper = mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(wrapper.find(LoginCallback).length).toBe(1);
    expect(wrapper.text()).toBe('');
  });

  it('does not render children', async () => {
    const wrapper = mount(
      <Security {...mockProps}>
        <LoginCallback>
          404
        </LoginCallback>
      </Security>
    );
    expect(wrapper.find(LoginCallback).length).toBe(1);
    expect(wrapper.text()).toBe('');
  });

  it('calls handleLoginRedirect when authState is resolved', async () => {
    mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(oktaAuth.start).toHaveBeenCalledTimes(1);
  });

  it('does not call handleLoginRedirect twice on double render', async () => {
    const wrapper = mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    // Force re-render of LoginCallback to replicate double render in React18 StrictMode
    await wrapper.render();
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(oktaAuth.start).toHaveBeenCalledTimes(1);
  });

  describe('if isLoginRedirect == false', () => {
    beforeEach(function() {
      isLoginRedirect = false;
    });

    it('if there are no children, renders error', async () => {
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.find(LoginCallback).length).toBe(1);
      expect(wrapper.text()).toBe('AuthSdkError: Can\'t handle login redirect');
    });
  
    it('renders children as a fallback', async () => {
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback>
            404
          </LoginCallback>
        </Security>
      );
      expect(wrapper.find(LoginCallback).length).toBe(1);
      expect(wrapper.text()).toBe('404');
    });

    it('renders loading until isLoginRedirect == false AND handleLoginRedirect() is done', async () => {
      isLoginRedirect = true;
      let handlingRedirect = false;
      oktaAuth.handleLoginRedirect = jest.fn().mockImplementation(async () => {
        handlingRedirect = true;
        isLoginRedirect = false;
        // At this point oktaAuth.isLoginRedirect() returns false, but handleLoginRedirect() is not resolved yet
        await delay(500);
        handlingRedirect = false;
        authState = { isAuthenticated: true };
      });

      wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback loadingElement={"Loading"}>
            Fallback
          </LoginCallback>
        </Security>,
        { attachTo: container }
      );

      // At this point oktaAuth.isLoginRedirect() is false (browser location is not a login redirect anymore)
      // But handleLoginRedirect() has not resolved yet
      expect(oktaAuth.handleLoginRedirect).toHaveBeenCalledTimes(1);
      expect(handlingRedirect).toBe(true);
      expect(isLoginRedirect).toBe(false);
      expect(container?.innerHTML).toBe('Loading');

      // Finish handling a login redirect, update auth state to force re-render
      await act(async () => {
        jest.runAllTimers();
      });
      expect(handlingRedirect).toBe(false);
      await act(async () => {
        notifySubscribers(authState);
      });
      expect(container?.innerHTML).toBe('Fallback');
    });
  });

  describe('isInteractionRequired', () => {
    it('will not trigger a passed onAuthResume when isInteractionRequired is false', () => { 
      const resumeFunction = jest.fn();
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback onAuthResume={resumeFunction}/>
        </Security>
      );
      expect(resumeFunction).not.toHaveBeenCalled();
      expect(wrapper.text()).toBe('');
    });

    it('will trigger a passed onAuthResume function when isInteractionRequired is true', () => {
      oktaAuth.idx.isInteractionRequired = jest.fn().mockImplementation( () => true );
      const resumeFunction = jest.fn();
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback onAuthResume={resumeFunction}/>
        </Security>
      );
      expect(resumeFunction).toHaveBeenCalled();
      expect(wrapper.text()).toBe(''); // no output since we expect to be redirected
    });

    // eslint-disable-next-line jest/expect-expect
    it('will treat isInteractionRequired like a normal error if not onAuthResume is passed', async () => { 
      oktaAuth.idx.isInteractionRequired = jest.fn().mockImplementation( () => true );
      authState = {
        isAuthenticated: false,
        error: new Error('error on callback')
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('Error: error on callback');
    });
  });

  describe('shows errors', () => {
    it('does not render errors without an error', () => { 
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('');
    });

    it('renders errors if there is an error', () => {
      authState = {
        isAuthenticated: true,
        error: new Error('oh drat!')
      };

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('Error: oh drat!');
    });
    
    // eslint-disable-next-line jest/expect-expect
    it('renders errors caught from handleLoginRedirect', async () => {
      authState = {
        isAuthenticated: false
      };
      oktaAuth.handleLoginRedirect = jest.fn().mockImplementation(() =>
        Promise.reject(new Error('error on callback'))
      );
      const container = document.createElement('div');
      await act(async () => {
        render(
          <Security {...mockProps}>
            <LoginCallback />
          </Security>,
          container
        );
      });
      expect(container?.innerHTML).toBe('<p>Error: error on callback</p>');
    });

    it('can be passed a custom component to render', () => {
      authState = {
        isAuthenticated: true,
        error: { has: 'errorData' }
      };

      const MyErrorComponent = (props: any) => { 
        return (<p>Override: {props.error.has}</p>);
      };

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback errorComponent={MyErrorComponent} />
        </Security>
      );
      expect(wrapper.text()).toBe('Override: errorData');
    });

    it('uses errorComponent provided from Security', () => {
      authState = {
        isAuthenticated: true,
        error: { has: 'errorData' }
      };

      const MyErrorComponent = (props: any) => { 
        return (<p>Override: {props.error.has}</p>);
      };

      const wrapper = mount(
        <Security {...mockProps} errorComponent={MyErrorComponent}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('Override: errorData');
    });

    it('uses errorComponent prop from LoginCallback if provided from both LoginCallback and Security', () => {
      authState = {
        isAuthenticated: true,
        error: { has: 'errorData' }
      };

      const SecurityErrorComponent = (props: any) => { 
        return (<p>Security Error: {props.error.has}</p>);
      };

      const LoginCallbackErrorComponent = (props: any) => { 
        return (<p>Callback Error: {props.error.has}</p>);
      };

      const wrapper = mount(
        <Security {...mockProps} errorComponent={SecurityErrorComponent}>
          <LoginCallback  errorComponent={LoginCallbackErrorComponent} />
        </Security>
      );
      expect(wrapper.text()).toBe('Callback Error: errorData');
    });
  });

  describe('shows loading', () => {
    it('does not render loading by default', () => { 
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('');
    });

    it('custom loading element can be passed to render during loading', () => {
      const MyLoadingElement = (<p>loading...</p>);

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback loadingElement={MyLoadingElement}/>
        </Security>
      );
      expect(wrapper.text()).toBe('loading...');
    });

    it('uses loadingElement provided from Security', () => {
      const SecurityLoadingElement = (<p>Loading...</p>);

      const wrapper = mount(
        <Security {...mockProps} loadingElement={SecurityLoadingElement}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('Loading...');
    });

    it('uses loadingElement prop from LoginCallback if provided from both LoginCallback and Security', () => {
      const SecurityLoadingElement = (<p>Loading...</p>);
      const LoginCallbackLoadingElement = (<p>Login callback...</p>);

      const wrapper = mount(
        <Security {...mockProps} loadingElement={SecurityLoadingElement}>
          <LoginCallback loadingElement={LoginCallbackLoadingElement} />
        </Security>
      );
      expect(wrapper.text()).toBe('Login callback...');
    });

    it('does not render loading element on error', () => {
      authState = {
        isAuthenticated: true,
        error: new Error('oh drat!')
      };
      const MyLoadingElement = (<p>loading...</p>);

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback loadingElement={MyLoadingElement}/>
        </Security>
      );
      expect(wrapper.text()).toBe('Error: oh drat!');
    });

    it('renders loading element if onAuthResume is passed', async () => { 
      oktaAuth.idx.isInteractionRequired = jest.fn().mockImplementation( () => true );
      const resumeFunction = jest.fn();
      const MyLoadingElement = (<p>loading...</p>);
      jest.spyOn(React, 'useEffect').mockImplementation(f => f())

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback onAuthResume={resumeFunction} loadingElement={MyLoadingElement}/>
        </Security>
      );
      expect(resumeFunction).toHaveBeenCalled();
      expect(wrapper.text()).toBe('loading...');
    });
  });
});

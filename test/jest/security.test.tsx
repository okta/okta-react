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
import { MemoryRouter } from 'react-router-dom';
import Security from '../../src/Security';
import { useOktaAuth } from '../../src/OktaContext';

console.warn = jest.fn();

describe('<Security />', () => {
  let oktaAuth;
  let initialAuthState;
  const restoreOriginalUri = async (_, url) => {
    location.href = url;
  };
  beforeEach(() => {
    jest.clearAllMocks();

    initialAuthState = {
      isInitialState: true
    };
    oktaAuth = {
      _oktaUserAgent: {
        addEnvironment: jest.fn(),
        getHttpHeader: jest.fn(),
        getVersion: jest.fn()
      },
      options: {},
      authStateManager: {
        getAuthState: jest.fn().mockImplementation(() => initialAuthState),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      },
      start: jest.fn(),
      stop: jest.fn(),
    };
  });

  it('adds an environmemnt to oktaAuth\'s _oktaUserAgent', () => {
    const addEnvironmentSpy = jest.spyOn(oktaAuth._oktaUserAgent, 'addEnvironment');

    const mockProps = {
      oktaAuth,
      restoreOriginalUri
    };
    mount(<Security {...mockProps} />);
    expect(addEnvironmentSpy).toBeCalledWith(`${process.env.PACKAGE_NAME}/${process.env.PACKAGE_VERSION}`);
  });

  it('logs a warning in case _oktaUserAgent is not available on auth SDK instance', () => {
    const oktaAuthWithoutUserAgent = {
      ...oktaAuth
    };
    delete oktaAuthWithoutUserAgent['_oktaUserAgent'];
    const mockProps = {
      oktaAuth: oktaAuthWithoutUserAgent,
      restoreOriginalUri
    };
    mount(<Security {...mockProps} />);
    expect(console.warn).toBeCalled();
  });

  describe('throws version not match error', () => {
    let originalConsole;

    // turn off SKIP_VERSION_CHECK to test the functionality
    beforeEach(() => {
      process.env.SKIP_VERSION_CHECK = '0';

      originalConsole = global.console;
      global.console = {
        ...originalConsole,
        warn: jest.fn()
      };
    });
    afterEach(() => {
      process.env.SKIP_VERSION_CHECK = '1';
      global.console = originalConsole;
    });
    it('throws runtime error when passed in authJS version is too low', () => {
      const oktaAuthWithMismatchingSDKVersion = {
        ...oktaAuth,
        _oktaUserAgent: {
          addEnvironment: jest.fn(),
          getVersion: jest.fn().mockReturnValue('1.0.0') // intentional large mock version
        }
      };

      const mockProps = {
        oktaAuth: oktaAuthWithMismatchingSDKVersion,
        restoreOriginalUri
      };

      const wrapper = mount(<Security {...mockProps} />);
      expect(wrapper.find(Security).text().trim()).toBe(`AuthSdkError: 
        Passed in oktaAuth is not compatible with the SDK,
        minimum supported okta-auth-js version is 5.3.1.`
      );
    });

    it('logs a warning when _oktaUserAgent is not available', () => {
      const oktaAuthWithMismatchingSDKVersion = {
        ...oktaAuth,
        _oktaUserAgent: undefined
      };

      const mockProps = {
        oktaAuth: oktaAuthWithMismatchingSDKVersion,
        restoreOriginalUri
      };

      mount(<Security {...mockProps} />);
      expect(global.console.warn).toHaveBeenCalledWith('_oktaUserAgent is not available on auth SDK instance. Please use okta-auth-js@^5.3.1 .');
    });
  });

  it('should set default restoreOriginalUri callback in oktaAuth.options', () => {
    oktaAuth.options = {};
    const mockProps = {
      oktaAuth,
      restoreOriginalUri
    };
    mount(<Security {...mockProps} />);
    expect(oktaAuth.options.restoreOriginalUri).toBeDefined();
  });

  it('gets initial state from oktaAuth and exposes it on the context', () => {
    const mockProps = {
      oktaAuth,
      restoreOriginalUri
    };
    const MyComponent = jest.fn().mockImplementation(() => {
      const oktaProps = useOktaAuth();
      expect(oktaProps.authState).toBe(initialAuthState);
      return null; 
    });
    mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      </MemoryRouter>
    );
    expect(oktaAuth.authStateManager.getAuthState).toHaveBeenCalled();
    expect(MyComponent).toHaveBeenCalled();
  });

  it('calls start and updates the context', () => {
    const newAuthState = {
      fromUpdateAuthState: true
    };
    let callback;
    oktaAuth.authStateManager.subscribe.mockImplementation(fn => {
      callback = fn;
    });
    oktaAuth.start.mockImplementation(() => {
      callback(newAuthState);
    });
    const mockProps = {
      oktaAuth,
      restoreOriginalUri
    };

    const MyComponent = jest.fn()
      // first call
      .mockImplementationOnce(() => {
        const oktaProps = useOktaAuth();
        expect(oktaProps.authState).toBe(initialAuthState);
        return null;
      })
      // second call
      .mockImplementationOnce(() => {
        const oktaProps = useOktaAuth();
        expect(oktaProps.authState).toBe(newAuthState);
        return null;
      });

    mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      </MemoryRouter>
    );

    expect(oktaAuth.authStateManager.subscribe).toHaveBeenCalledTimes(1);
    expect(oktaAuth.start).toHaveBeenCalledTimes(1);
    expect(MyComponent).toHaveBeenCalledTimes(2);
  });

  it('subscribes to "authStateChange" and updates the context', () => {
    const mockAuthStates = [
      initialAuthState,
      {
        fromUpdateAuthState: true
      },
      {
        fromEventDispatch: true
      }
    ];
    const callbacks = [];
    let stateCount = 0;
    callbacks.push(() => {
      // dummy subscriber that should be preserved after `<Security />` unmount
    });
    oktaAuth.authStateManager.getAuthState.mockImplementation( () => { 
      return mockAuthStates[stateCount];
    });
    oktaAuth.authStateManager.subscribe.mockImplementation(fn => {
      callbacks.push(fn);
    });
    oktaAuth.authStateManager.unsubscribe.mockImplementation(fn => {
      const index = callbacks.indexOf(fn);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    });
    oktaAuth.start.mockImplementation(() => {
      stateCount++;
      callbacks.map(fn => fn(mockAuthStates[stateCount]));
    });
    const mockProps = {
      oktaAuth,
      restoreOriginalUri
    };
    const MyComponent = jest.fn()
      // first call
      .mockImplementationOnce(() => {
        const oktaProps = useOktaAuth();
        expect(oktaProps.authState).toBe(initialAuthState);
        return null;
      })
      // second call
      .mockImplementationOnce(() => {
        const oktaProps = useOktaAuth();
        expect(oktaProps.authState).toBe(mockAuthStates[1]);
        return null;
      })
      // third call
      .mockImplementationOnce(() => {
        const oktaProps = useOktaAuth();
        expect(oktaProps.authState).toBe(mockAuthStates[2]);
        return null;
      });

    const component = mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      </MemoryRouter>
    );
    expect(callbacks.length).toEqual(2);
    expect(oktaAuth.authStateManager.subscribe).toHaveBeenCalledTimes(1);
    expect(oktaAuth.start).toHaveBeenCalledTimes(1);
    expect(MyComponent).toHaveBeenCalledTimes(2);
    MyComponent.mockClear();
    act(() => {
      stateCount++;
      callbacks.map(fn => fn(mockAuthStates[stateCount]));
    });
    expect(MyComponent).toHaveBeenCalledTimes(1);

    component.unmount();
    expect(oktaAuth.stop).toHaveBeenCalledTimes(1);
    expect(callbacks.length).toEqual(1);
  });

  it('should accept a className prop and render a component using the className', () => {
    const mockProps = {
      oktaAuth,
      restoreOriginalUri
    };
    const wrapper = mount(
      <MemoryRouter>
        <Security {...mockProps} className='foo bar' />
      </MemoryRouter>
    );
    expect(wrapper.find(Security).hasClass('foo bar')).toEqual(true);
    expect(wrapper.find(Security).props().className).toBe('foo bar');
  });

  describe('render children', () => {
    const MyComponent = function() {
      const { authState } = useOktaAuth();
      if (!authState) {
        return <div>loading</div>;
      }

      if (authState.isAuthenticated) {
        return <div>Authenticated!</div>;
      }

      return <div>Not authenticated!</div>;
    };

    it('should render "Authenticated" with preset authState.isAuthenticated as true', () => {
      initialAuthState = {
        isAuthenticated: true
      };
      const mockProps = {
        oktaAuth,
        restoreOriginalUri
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>Authenticated!</div>');
    });

    it('should render "Not authenticated" with preset authState.isAuthenticated as false', () => {
      initialAuthState = {
        isAuthenticated: false
      };
      const mockProps = {
        oktaAuth,
        restoreOriginalUri
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>Not authenticated!</div>');
    });

    it('should render "loading" with preset authState is null', () => {
      initialAuthState = null;
      const mockProps = {
        oktaAuth,
        restoreOriginalUri
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>loading</div>');
    });

    it('should render error if oktaAuth props is not provided', () => {
      const mockProps = {
        oktaAuth: null,
        restoreOriginalUri
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(Security).html()).toBe('<p>AuthSdkError: No oktaAuth instance passed to Security Component.</p>');
    });

    it('should render error if restoreOriginalUri prop is not provided', () => {
      const mockProps = {
        oktaAuth,
        restoreOriginalUri: null
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(Security).html()).toBe('<p>AuthSdkError: No restoreOriginalUri callback passed to Security Component.</p>');
    });
  });
});

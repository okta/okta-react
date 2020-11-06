import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from "react-router-dom";
import Security from "../../src/Security";
import { useOktaAuth } from '../../src/OktaContext';

describe('<Security />', () => {
  let oktaAuth;
  let initialAuthState;
  beforeEach(() => {
    initialAuthState = {
      isInitialState: true
    };
    oktaAuth = {
      userAgent: 'okta/okta-auth-js',
      options: {},
      authStateManager: {
        getAuthState: jest.fn().mockImplementation(() => initialAuthState),
        subscribe: jest.fn(),
        updateAuthState: jest.fn(),
      },
      isLoginRedirect: jest.fn().mockImplementation(() => false),
    };
  });

  it('should set userAgent for oktaAuth', () => {
    const mockProps = {
      oktaAuth
    };
    mount(<Security {...mockProps} />);
    expect(oktaAuth.userAgent).toEqual('@okta/okta-react/4.0.0 okta/okta-auth-js');
  });

  it('should set default restoreOriginalUri callback in oktaAuth.options', () => {
    oktaAuth.options = {};
    const mockProps = {
      oktaAuth
    };
    mount(<Security {...mockProps} />);
    expect(oktaAuth.options.restoreOriginalUri).toBeDefined();
  });

  it('gets initial state from oktaAuth and exposes it on the context', () => {
    const mockProps = {
      oktaAuth
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

  it('calls updateAuthState and updates the context', () => {
    const newAuthState = {
      fromUpdateAuthState: true
    };
    let callback;
    oktaAuth.authStateManager.subscribe.mockImplementation(fn => {
      callback = fn;
    });
    oktaAuth.authStateManager.updateAuthState.mockImplementation(() => {
      callback(newAuthState);
    });
    const mockProps = {
      oktaAuth
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
    expect(oktaAuth.authStateManager.updateAuthState).toHaveBeenCalledTimes(1);
    expect(MyComponent).toHaveBeenCalledTimes(2);
  });

  it('should not call updateAuthState when in login redirect state', () => {
    oktaAuth.isLoginRedirect = jest.fn().mockImplementation(() => true);
    const mockProps = {
      oktaAuth
    };
    mount(
      <MemoryRouter>
        <Security {...mockProps} />
      </MemoryRouter>
    );
    expect(oktaAuth.authStateManager.updateAuthState).not.toHaveBeenCalled();
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
    let callback;
    let stateCount = 0;
    oktaAuth.authStateManager.getAuthState.mockImplementation( () => { 
      return mockAuthStates[stateCount];
    });
    oktaAuth.authStateManager.subscribe.mockImplementation(fn => {
      callback = fn;
    });
    oktaAuth.authStateManager.updateAuthState.mockImplementation(() => {
      stateCount++;
      callback(mockAuthStates[stateCount]);
    });
    const mockProps = {
      oktaAuth
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

    mount(
      <MemoryRouter>
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      </MemoryRouter>
    );
    expect(oktaAuth.authStateManager.subscribe).toHaveBeenCalledTimes(1);
    expect(oktaAuth.authStateManager.updateAuthState).toHaveBeenCalledTimes(1);
    expect(MyComponent).toHaveBeenCalledTimes(2);
    MyComponent.mockClear();
    act(() => {
      stateCount++;
      callback(mockAuthStates[stateCount]);
    });
    expect(MyComponent).toHaveBeenCalledTimes(1);
  });

  it('should accept a className prop and render a component using the className', () => {
    const mockProps = {
      oktaAuth
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
      if (authState.isPending) {
        return <div>loading</div>;
      }

      if (authState.isAuthenticated) {
        return <div>Authenticated!</div>;
      }

      return <div>Not authenticated!</div>;
    };

    it('should render "Authenticated" with preset authState.isAuthenticated as true', () => {
      initialAuthState = {
        isAuthenticated: true,
        isPending: false
      };
      const mockProps = {
        oktaAuth
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
        isAuthenticated: false,
        isPending: false
      };
      const mockProps = {
        oktaAuth
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>Not authenticated!</div>');
    });

    it('should render "loading" with preset authState.isPending as true', () => {
      initialAuthState = {
        isPending: true
      };
      const mockProps = {
        oktaAuth
      };
      const wrapper = mount(
        <Security {...mockProps}>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>loading</div>');
    });

    it('should render error if oktaAuth props is not provided', () => {
      const wrapper = mount(
        <Security>
          <MyComponent />
        </Security>
      );
      expect(wrapper.find(Security).html()).toBe('<p>AuthSdkError: No oktaAuth instance passed to Security Component.</p>');
    });
  });
});

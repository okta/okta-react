import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from "react-router-dom";
import Security from "../../src/Security";
import { useOktaAuth } from '../../src/OktaContext';

describe('<Security />', () => {
  const VALID_CONFIG = {
    issuer: 'https://example.com/oauth2/default',
    clientId: 'foo',
    redirectUri: 'https://example.com'
  };
  let oktaAuth;
  let initialAuthState;
  beforeEach(() => {
    initialAuthState = {
      isInitialState: true
    };
    oktaAuth = {
      options: {},
      authStateManager: {
        getAuthState: jest.fn().mockImplementation(() => initialAuthState),
        subscribe: jest.fn(),
        updateAuthState: jest.fn(),
      },
      isLoginRedirect: jest.fn().mockImplementation(() => false),
    };
  });

  it('gets initial state from authService and exposes it on the context', () => {
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
});

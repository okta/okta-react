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
import { mount } from 'enzyme';

/* Forces Jest to use same version of React to enable fresh module state via isolateModulesAsync() call in beforeEach().
Otherwise, React raises "Invalid hook call" error because of multiple copies of React, see: https://github.com/jestjs/jest/issues/11471#issuecomment-851266333 */
jest.mock('react', () => jest.requireActual('react'));

describe('<LoginCallback />', () => {
  let oktaAuth: any;
  let authState: any;
  let mockProps: any;
  let Security: any;
  let LoginCallback: any;
  const restoreOriginalUri = async (_: any, url: string) => {
    location.href = url;
  };
  beforeEach(async () => {
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
      Security = (await import('../../src/Security')).default
      LoginCallback = (await import('../../src/LoginCallback')).default
    })
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
  })

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
    it('renders errors caught from handleLoginRedirect', async () => {
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

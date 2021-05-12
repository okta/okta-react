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
import LoginCallback from '../../src/LoginCallback';
import Security from '../../src/Security';

describe('<LoginCallback />', () => {
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
        updateAuthState: jest.fn(),
      },
      isLoginRedirect: jest.fn().mockImplementation(() => false),
      isInteractionRequired: jest.fn().mockImplementation( () => false ),
      handleLoginRedirect: jest.fn().mockImplementation( () => Promise.resolve() ),
      start: jest.fn(),
    };
    mockProps = {
      oktaAuth, 
      restoreOriginalUri
    };
  });

  it('renders the component', () => {
    const wrapper = mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(wrapper.find(LoginCallback).length).toBe(1);
    expect(wrapper.text()).toBe('');
  });

  it('calls handleLoginRedirect when authState is resolved', () => {
    authState = {
      isAuthorized: true
    }

    mount(
      <Security {...mockProps}>
        <LoginCallback />
      </Security>
    );
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalledTimes(1);
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

    it('can be passed a custom component to render', () => {
      authState = {
        isAuthenticated: true,
        error: { has: 'errorData' }
      };

      const MyErrorComponent = ({ error }) => { 
      return (<p>Override: {error.has}</p>);
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
      oktaAuth.isInteractionRequired = jest.fn().mockImplementation( () => true );
      const resumeFunction = jest.fn();
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback onAuthResume={resumeFunction}/>
        </Security>
      );
      expect(resumeFunction).toHaveBeenCalled();
      expect(wrapper.text()).toBe(''); // no output since we expect to be redirected
    });

    it('renders errors caught from handleLoginRedirect', async () => {
      const errorMsg = 'error on callback';
      authState = {
        isAuthenticated: false
      };
      oktaAuth.handleLoginRedirect.mockImplementation(() => {
        return Promise.reject(new Error(errorMsg));
      });
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      return await act(async () => {
        await wrapper.update(); // set state
        await wrapper.update();
        await wrapper.update(); // render error
        expect(wrapper.text()).toBe('Error: ' + errorMsg);
      });
    });

    it('will treat isInteractionRequired like a normal error if not onAuthResume is passed', async () => { 
      oktaAuth.isInteractionRequired = jest.fn().mockImplementation( () => true );
      const errorMsg = 'error on callback';
      authState = {
        isAuthenticated: false
      };
      oktaAuth.handleLoginRedirect.mockImplementation(() => {
        return Promise.reject(new Error(errorMsg));
      });
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      return await act(async () => {
        await wrapper.update(); // set state
        await wrapper.update();
        await wrapper.update(); // render error
        expect(wrapper.text()).toBe('Error: ' + errorMsg);
      });
    });
  });

});

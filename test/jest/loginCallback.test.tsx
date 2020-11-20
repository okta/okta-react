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
import LoginCallback from '../../src/LoginCallback';
import Security from '../../src/Security';

describe('<LoginCallback />', () => {
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
        updateAuthState: jest.fn(),
      },
      isLoginRedirect: jest.fn().mockImplementation(() => false),
      handleLoginRedirect: jest.fn()
    };
    mockProps = { oktaAuth };
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
    authState.isPending = false;
    authState.isAuthorized = true;

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

    it('does not render errors while authState.isPending', () => { 
      authState.error = new Error('oh drat!');
      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('');
    });

    it('renders errors while authState is not pending and there is an error', () => { 
      authState.isPending = false;
      authState.isAuthenticated = true;
      authState.error = new Error('oh drat!');

      const wrapper = mount(
        <Security {...mockProps}>
          <LoginCallback />
        </Security>
      );
      expect(wrapper.text()).toBe('Error: oh drat!');
    });

    it('can be passed a custom component to render', () => { 
      authState.isPending = false;
      authState.isAuthenticated = true;
      authState.error = { has: 'errorData' };

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

  });

});

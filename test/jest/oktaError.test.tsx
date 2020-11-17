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
import OktaError from '../../src/OktaError';
import { AuthSdkError, AuthApiError, OAuthError } from '@okta/okta-auth-js';

describe('<OktaError />', () => {
    it('renders a generic error', () => {
      const errorMessage = 'I am a test error message';
      const error = new Error(errorMessage);
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`Error: ${errorMessage}`);
    });
    it('renders an AuthSdkError', () => {
      const errorMessage = 'I am a test error message';
      const error = new AuthSdkError(errorMessage);
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`AuthSdkError: ${errorMessage}`);
    });
    it('renders an AuthApiError', () => {
      const errorSummary = 'I am a test error message';
      const errorCode = '400'; 
      const errorLink = 'http://errorlink.com';
      const errorId = 'fake error id'; 
      const errorCauses = ['fake error cause'];
      const error = new AuthApiError({ errorSummary, errorCode, errorLink, errorId, errorCauses });
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`AuthApiError: ${errorSummary}`);
    });
    it('renders an OAuthError', () => {
      const errorCode = '400';
      const errorSummary = 'I am a test error message';
      const error = new OAuthError(errorCode, errorSummary);
      const wrapper = mount(
        <OktaError error={error}/>
      );
      expect(wrapper.text()).toBe(`OAuthError: ${errorSummary}`);
    });
});


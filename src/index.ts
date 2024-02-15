/*
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

import Security from './context/Security';
import withOktaAuth from './hocs/withOktaAuth';
import OktaContext, { useOktaAuth } from './context/OktaContext';
import LoginCallback from './containers/LoginCallback';
import SecureRoute from './containers/SecureRoute';
import Secure from './containers/Secure';
import withAuthRequired from './hocs/withAuthRequired';
import useAuthRequired from './hooks/useAuthRequired';
import useLoginCallback from './hooks/useLoginCallback';
import {
  loginCallbackHashRoutePath,
  getRelativeOriginalUri,
} from './utils';

export {
  Security,
  withOktaAuth,
  useOktaAuth,
  OktaContext,
  LoginCallback,
  SecureRoute,
  Secure,
  withAuthRequired,
  useAuthRequired,
  useLoginCallback,
  loginCallbackHashRoutePath,
  getRelativeOriginalUri,
};

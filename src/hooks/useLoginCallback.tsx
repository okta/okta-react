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
import { OnAuthResumeFunction, IOktaContext } from '../types';

export interface LoginCallbackOptions {
  onAuthResume?: OnAuthResumeFunction;
}

export interface LoginCallbackHook {
  isLoginRedirect: boolean;
  callbackError: Error | null;
}

const useLoginCallback = (
  oktaContext: IOktaContext,
  options: LoginCallbackOptions = {}
): LoginCallbackHook => {
  const { onAuthResume } = options;
  const { oktaAuth, authState } = oktaContext;

  const [callbackError, setCallbackError] = React.useState<Error | null>(null);
  const handlingRedirectRef = React.useRef(false);
  // We don't want any side effects on `onAuthResume` change,
  //  so keep and use the latest value from the ref
  const onAuthResumeRef = React.useRef(onAuthResume);
  onAuthResumeRef.current = onAuthResume;

  const authError = authState?.error;
  const displayError = callbackError || authError || null;

  React.useEffect(() => {
    if (!oktaAuth.isLoginRedirect()) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore OKTA-464505: backward compatibility support for auth-js@5
    const isInteractionRequired = oktaAuth.idx.isInteractionRequired || oktaAuth.isInteractionRequired.bind(oktaAuth);
    if (onAuthResumeRef.current && isInteractionRequired()) {
      onAuthResumeRef.current();
      return;
    }
    // OKTA-635977: Prevents multiple calls of handleLoginRedirect() in React18 StrictMode
    if (!handlingRedirectRef.current) {
      handlingRedirectRef.current = true;
      oktaAuth.handleLoginRedirect().catch(e => {
        setCallbackError(e);
      }).finally(() => {
        handlingRedirectRef.current = false;
      });
    }
  }, [oktaAuth]);

  // During `handleLoginRedirect()` auth-js will clear location hash/search
  //  so `isLoginRedirect()` will return false in that moment.
  // Need to return `isLoginRedirect: true` until callback is completed.
  const isLoginRedirect = oktaAuth.isLoginRedirect() || handlingRedirectRef.current;

  return {
    isLoginRedirect,
    callbackError: displayError,
  };
};

export default useLoginCallback;

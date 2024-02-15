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
import { OnAuthResumeFunction, IOktaContext } from '../context/OktaContext';

export interface LoginCallbackOptions {
  onAuthResume?: OnAuthResumeFunction;
  // true to check `canHandleRedirect()` before logic
  // false (default) to assume that current page is a login callback page
  strict?: boolean;
}

export interface LoginCallbackHook {
  canHandleRedirect: boolean;
  callbackError: Error | null;
}

const useLoginCallback = (
  context: IOktaContext,
  options: LoginCallbackOptions = {}
): LoginCallbackHook => {
  const { onAuthResume, strict } = options;
  const { oktaAuth, authState } = context;

  const [callbackError, setCallbackError] = React.useState<Error | null>(null);
  const handledRedirectRef = React.useRef(false);
  const onAuthResumeRef = React.useRef(onAuthResume);
  onAuthResumeRef.current = onAuthResume;
  const canHandleRedirect = React.useMemo(() =>
    strict ? oktaAuth.token.isLoginRedirect() : true,
    [ strict, oktaAuth ]
  );

  const authError = authState?.error;
  const displayError = callbackError || authError || null;

  React.useEffect(() => {
    if (!canHandleRedirect) {
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
    if (!handledRedirectRef.current) {
      handledRedirectRef.current = true;
      oktaAuth.handleLoginRedirect().catch(e => {
        setCallbackError(e);
      })
    }
  }, [oktaAuth, canHandleRedirect]);

  return {
    canHandleRedirect,
    callbackError: displayError,
  };
};

export default useLoginCallback;

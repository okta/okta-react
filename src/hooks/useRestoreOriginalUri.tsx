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
import { OktaAuth } from '@okta/okta-auth-js';
import { RestoreOriginalUriFunction } from '../context/OktaContext';

const useRestoreOriginalUri = (
  oktaAuth: OktaAuth,
  restoreOriginalUri: RestoreOriginalUriFunction,
): null => {
  // We don't want any side effects (excess render, effect run) on `restoreOriginalUri` change,
  //  so keep and use the latest value from the ref
  const restoreOriginalUriRef = React.useRef(restoreOriginalUri);
  restoreOriginalUriRef.current = restoreOriginalUri;

  // Override `restoreOriginalUri` callback in `oktaAuth`
  React.useEffect(() => {
    if (!oktaAuth) {
      return;
    }

    // props.restoreOriginalUri is required, therefore if options.restoreOriginalUri exists, there are 2 callbacks
    const originalCallback = oktaAuth.options.restoreOriginalUri;
    if (originalCallback) {
      console.warn('Two custom restoreOriginalUri callbacks are detected. The one from the OktaAuth configuration will be overridden by the provided restoreOriginalUri prop from the Security component.');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    oktaAuth.options.restoreOriginalUri = (async (oktaAuth: unknown, originalUri: string) => {
      restoreOriginalUriRef.current?.(oktaAuth as OktaAuth, originalUri);
    }) as ((oktaAuth: OktaAuth, originalUri?: string) => Promise<void>);

    return () => {
      // Restore original callback
      oktaAuth.options.restoreOriginalUri = originalCallback;
    };
  }, [oktaAuth]);

  return null;
};

export default useRestoreOriginalUri;

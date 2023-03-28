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

import * as React from "react";
import { useOktaAuth } from "./OktaContext";
import { Route } from "react-router-dom";
import { toRelativeUrl } from "@okta/okta-auth-js";
import OktaError from "./OktaError";

const SecureRoute: React.FC<{
  onAuthRequired?: (oktaAuth: any, originalUri: string) => void | Promise<void>;
  errorComponent?: React.ComponentType<{ error: Error }>;
  path?: string;
  element?: React.ReactNode;
}> = ({ onAuthRequired, errorComponent, element, path }) => {
  const { oktaAuth, authState, _onAuthRequired } = useOktaAuth();
  const pendingLogin = React.useRef(false);
  const [handleLoginError, setHandleLoginError] = React.useState<Error | null>(
    null
  );
  const ErrorReporter = errorComponent || OktaError;

  React.useEffect(() => {
    const handleLogin = async () => {
      if (pendingLogin.current) {
        return;
      }

      pendingLogin.current = true;

      const originalUri = toRelativeUrl(
        window.location.href,
        window.location.origin
      );
      const onAuthRequiredFn = onAuthRequired || _onAuthRequired;
      oktaAuth.setOriginalUri(originalUri);
      if (onAuthRequiredFn) {
        await onAuthRequiredFn(oktaAuth, originalUri);
      } else {
        await oktaAuth.signInWithRedirect();
      }
    };

    if (!authState) {
      return;
    }

    if (authState.isAuthenticated) {
      pendingLogin.current = false;
      return;
    }

    if (!authState.isAuthenticated) {
      handleLogin().catch((err) => {
        setHandleLoginError(err as Error);
      });
    }
  }, [authState, oktaAuth, onAuthRequired]);

  if (handleLoginError) {
    return <ErrorReporter error={handleLoginError} />;
  }

  if (!authState || !authState.isAuthenticated) {
    return null;
  }

  return <Route path={path} element={element} />;
};

export default SecureRoute;

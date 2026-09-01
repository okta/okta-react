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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { AuthSdkError } from '@okta/okta-auth-js';

export class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      error: null
    } as {
      error: AuthSdkError | null
    };
  }

  componentDidCatch(error: AuthSdkError) {
    this.setState({ error: error });
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return <p>{ this.state.error.toString() }</p>;
    }

    return this.props.children;
  }
}

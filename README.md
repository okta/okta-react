[Okta Auth SDK]: https://github.com/okta/okta-auth-js
[Okta SignIn Widget]: https://github.com/okta/okta-signin-widget
[AuthState]: https://github.com/okta/okta-auth-js#authstatemanager
[react-router]: https://github.com/ReactTraining/react-router
[reach-router]: https://reach.tech/router
[higher-order component]: https://reactjs.org/docs/higher-order-components.html
[React Hook]: https://reactjs.org/docs/hooks-intro.html
[React Context Provider]: https://reactjs.org/docs/context.html#contextprovider
[Migrating from 1.x]: #migrating

# Okta React SDK

[![npm version](https://img.shields.io/npm/v/@okta/okta-react.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react)
[![build status](https://img.shields.io/travis/okta/okta-react/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-react)

* [Release status](#release-status)
* [Getting started](#getting-started)
* [Installation](#installation)
* [Usage](#usage)
* [Reference](#reference)
* [Migrating between versions](#migrating-between-versions)
* [Contributing](#contributing)
* [Development](#development)

Okta React SDK builds on top of the [Okta Auth SDK][].

This SDK is a toolkit to build Okta integration with many common "router" packages, such as [react-router][], [reach-router][], and others.

Users migrating from version 1.x of this SDK that required [react-router][] should see [Migrating from 1.x](#migrating-from-1x-to-20) to learn what changes are necessary.

With the [Okta Auth SDK][], you can:

- Login and logout from Okta using the [OAuth 2.0 API](https://developer.okta.com/docs/api/resources/oidc)
- Retrieve user information
- Determine authentication status
- Validate the current user's session

All of these features are supported by this SDK. Additionally, using this SDK, you can:

- Add "secure" routes, which will require authentication before render
- Define custom logic/behavior when authentication is required
- Provide an instance of the [Okta Auth SDK][] and the latest [AuthState][] to your components using a [React Hook][] or a [higher-order component][]

> This SDK does not provide any UI components.

> This SDK does not currently support Server Side Rendering (SSR)

This library currently supports:

- [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1) with [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636) 

## Release Status

:heavy_check_mark: The current stable major version series is: `6.x`

| Version   | Status                           |
| -------   | -------------------------------- |
| `6.x`     | :heavy_check_mark: Stable        |
| `5.x`     | :heavy_check_mark: Stable        |
| `4.x`     | :x: Retired                      |
| `3.x`     | :x: Retired                      |
| `2.x`     | :x: Retired                      |
| `1.x`     | :x: Retired                      |

The latest release can always be found on the [releases page][github-releases].


## Getting Started

- If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
- An Okta Application, configured for Single-Page App (SPA) mode. This is done from the [Okta Developer Console](https://developer.okta.com/authentication-guide/implementing-authentication/implicit#1-setting-up-your-application). When following the wizard, use the default properties. They are are designed to work with our sample applications.

### Helpful Links

- [React Quickstart](https://facebook.github.io/react/docs/installation.html#creating-a-new-application)
  - If you don't have a React app, or are new to React, please start with this guide. It will walk you through the creation of a React app, creating routes, and other application development essentials.
- [Okta Sample Application](https://github.com/okta/samples-js-react)
  - A fully functional sample application built using this SDK.
- [Okta Guide: Sign users into your single-page application](https://developer.okta.com/docs/guides/sign-into-spa/react/before-you-begin/)
  - Step-by-step guide to integrating an existing React application with Okta login.
- [Strategies for Obtaining Tokens](https://github.com/okta/okta-auth-js#strategies-for-obtaining-tokens)

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-react).

Install `@okta/okta-react`

```bash
npm install --save @okta/okta-react
```

Install peer dependencies

```bash
npm install --save react
npm install --save react-dom
npm install --save react-router-dom
npm install --save @okta/okta-auth-js   # requires at least version 5.3.1
```

## Usage

`okta-react` provides the means to connect a React SPA with Okta OIDC information.  Most commonly, you will connect to a router library such as [react-router][].

### React-Router components (optional)

`okta-react` provides a number of pre-built components to connect a `react-router`-based SPA to Okta OIDC information.  You can use these components directly, or use them as a basis for building your own components.

- [SecureRoute](#secureroute) - A normal `Route` except authentication is needed to render the component.  

### General components

`okta-react` provides the necessary tools to build an integration with most common React-based SPA routers.

- [Security](#security) - Accepts [oktaAuth][Okta Auth SDK] instance (**required**) and additional [configuration](#configuration-options) as props. This component acts as a [React Context Provider][] that maintains the latest [authState][AuthState] and [oktaAuth][Okta Auth SDK] instance for the downstream consumers. This context can be accessed via the [useOktaAuth](#useoktaauth) React Hook, or the [withOktaAuth](#useoktaauth) Higher Order Component wrapper from it's descendant component.
- [LoginCallback](#logincallback) - A simple component which handles the login callback when the user is redirected back to the application from the Okta login site.  `<LoginCallback>` accepts an optional prop `errorComponent` that will be used to format the output for any error in handling the callback.  This component will be passed an `error` prop that is an error describing the problem.  (see the `<OktaError>` component for the default rendering)

Users of routers other than `react-router` can use [useOktaAuth](#useoktaauth) to see if `authState` is not null and `authState.isAuthenticated` is true.  If it is false, you can send them to login via [oktaAuth.signInWithRedirect()](https://github.com/okta/okta-auth-js#signinwithredirectoptions).  See the implementation of `<LoginCallback>` as an example.

### Available Hooks

These hooks can be used in a component that is a descendant of a `Security` component (`<Security>` provides the necessary context).  Class-based components can gain access to the same information via the `withOktaAuth` Higher Order Component, which provides `oktaAuth` and `authState` as props to the wrapped component.

- [useOktaAuth](#useoktaauth) - gives an object with two properties:
  - `oktaAuth` - the [Okta Auth SDK][] instance.
  - `authState` - the [AuthState][] object that shows the current authentication state of the user to your app (initial state is `null`).

### Minimal Example in React Router

#### Create Routes

This example defines 3 routes:

- **/** - Anyone can access the home page
- **/protected** - Protected is only visible to authenticated users
- **/login/callback** - This is where auth is handled for you after redirection

**Note:** Make sure you have the `/login/callback` url (absolute url) added in your Okta App's configuration.

> A common mistake is to try and apply an authentication requirement to all pages, THEN add an exception for the login page.  This often fails because of how routes are evaluated in most routing packages.  To avoid this problem, declare specific routes or branches of routes that require authentication without exceptions.

#### Creating React Router Routes with class-based components

```jsx
// src/App.js

import React, { Component } from 'react';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import { SecureRoute, Security, LoginCallback } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import Home from './Home';
import Protected from './Protected';

class App extends Component {
  constructor(props) {
    super(props);
    this.oktaAuth = new OktaAuth({
      issuer: 'https://{yourOktaDomain}/oauth2/default',
      clientId: '{clientId}',
      redirectUri: window.location.origin + '/login/callback'
    });
    this.restoreOriginalUri = async (_oktaAuth, originalUri) => {
      props.history.replace(toRelativeUrl(originalUri || '/', window.location.origin));
    };
  }

  render() {
    return (
      <Security oktaAuth={this.oktaAuth} restoreOriginalUri={this.restoreOriginalUri} >
        <Route path='/' exact={true} component={Home} />
        <SecureRoute path='/protected' component={Protected} />
        <Route path='/login/callback' component={LoginCallback} />
      </Security>
    );
  }
}

const AppWithRouterAccess = withRouter(App);
export default class extends Component {
  render() {
    return (<Router><AppWithRouterAccess/></Router>);
  }
}
```

#### Creating React Router Routes with function-based components

```jsx
import React from 'react';
import { SecureRoute, Security, LoginCallback } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom';
import Home from './Home';
import Protected from './Protected';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
});

const App = () => {
  const history = useHistory();
  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Route path='/' exact={true} component={Home} />
      <SecureRoute path='/protected' component={Protected} />
      <Route path='/login/callback' component={LoginCallback} />
    </Security>
  );
};

const AppWithRouterAccess = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouterAccess;
```

#### Show Login and Logout Buttons (class-based)

```jsx
// src/Home.js

import React, { Component } from 'react';
import { withOktaAuth } from '@okta/okta-react';

export default withOktaAuth(class Home extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login() {
    this.props.oktaAuth.signInWithRedirect();
  }

  async logout() {
    this.props.oktaAuth.signOut('/');
  }

  render() {
    if (!this.props.authState) return <div>Loading...</div>;
    return this.props.authState.isAuthenticated ?
      <button onClick={this.logout}>Logout</button> :
      <button onClick={this.login}>Login</button>;
  }
});
```

#### Show Login and Logout Buttons (function-based)

```jsx
// src/Home.js

const Home = () => {
  const { oktaAuth, authState } = useOktaAuth();

  const login = async () => oktaAuth.signInWithRedirect();
  const logout = async () => oktaAuth.signOut('/');

  if(!authState) {
    return <div>Loading...</div>;
  }

  if(!authState.isAuthenticated) {
    return (
      <div>
        <p>Not Logged in yet</p>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <p>Logged in!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
```

#### Use the Access Token (class-based)

When your users are authenticated, your React application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the React component could look like for this hypothetical example:

```jsx
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import { withOktaAuth } from '@okta/okta-react';

export default withOktaAuth(class MessageList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: null
    }
  }

  async componentDidMount() {
    try {
      const response = await fetch('http://localhost:{serverPort}/api/messages', {
        headers: {
          Authorization: 'Bearer ' + this.props.authState.accessToken
        }
      });
      const data = await response.json();
      this.setState({ messages: data.messages });
    } catch (err) {
      // handle error as needed
    }
  }

  render() {
    if (!this.state.messages) return <div>Loading...</div>;
    const items = this.state.messages.map(message =>
      <li key={message}>{message}</li>
    );
    return <ul>{items}</ul>;
  }
});
```

#### Use the Access Token (function-based)

When your users are authenticated, your React application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the React component could look like for this hypothetical example:

```jsx
import fetch from 'isomorphic-fetch';
import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';

export default MessageList = () => {
  const { authState } = useOktaAuth();
  const [messages, setMessages] = useState(null);

  useEffect( () => { 
    if(authState.isAuthenticated) { 
      const apiCall = async () => {
        try {
          const response = await fetch('http://localhost:{serverPort}/api/messages', {
            headers: {
              Authorization: 'Bearer ' + authState.accessToken.accessToken
            }
          });
          const data = await response.json();
          setMessages( data.messages );
        } catch (err) {
          // handle error as needed
        }
      }
      apiCall();
    }
  }, [authState] );

  if (!messages) return <div>Loading...</div>;
  const items = messages.map(message =>
    <li key={message}>{message}</li>
  );
  return <ul>{items}</ul>;
};
```

## Reference

### `Security`

`<Security>` is the top-most component of okta-react. It accepts [oktaAuth][Okta Auth SDK] instance and addtional configuration options as props.

#### oktaAuth

*(required)* The pre-initialized [oktaAuth][Okta Auth SDK] instance. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference) for details of how to initialize the instance.

#### restoreOriginalUri

*(required)* Callback function. Called to restore original URI during [oktaAuth.handleLoginRedirect()](https://github.com/okta/okta-auth-js#handleloginredirecttokens) is called. Will override [restoreOriginalUri option of oktaAuth](https://github.com/okta/okta-auth-js#restoreoriginaluri)

#### onAuthRequired

*(optional)* Callback function. Called when authentication is required. If this is not supplied, `okta-react` redirects to Okta. This callback will receive [oktaAuth][Okta Auth SDK] instance as the first function parameter. This is triggered when a [SecureRoute](#secureroute) is accessed without authentication. A common use case for this callback is to redirect users to a custom login route when authentication is required for a [SecureRoute](#secureroute).

#### Example

```jsx
import { useHistory } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
});

export default App = () => {
  const history = useHistory();

  const customAuthHandler = (oktaAuth) => {
    // Redirect to the /login page that has a CustomLoginComponent
    // This example is specific to React-Router
    history.push('/login');
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  return (
    <Security
      oktaAuth={oktaAuth}
      onAuthRequired={customAuthHandler}
      restoreOriginalUri={restoreOriginalUri}
    >
      <Route path='/login' component={CustomLoginComponent}>
      {/* some routes here */}
    </Security>
  );
};
```

#### PKCE Example

Assuming you have configured your application to allow the `Authorization code` grant type, you can implement the [PKCE flow](https://github.com/okta/okta-auth-js#pkce) with the following steps:

- Initialize [oktaAuth][Okta Auth SDK] instance (with default PKCE configuration as `true`) and pass it to the `Security` component.
- add `/login/callback` route with [LoginCallback](#logincallback) component to handle login redirect from OKTA.

```jsx
import { OktaAuth } from '@okta/okta-auth-js';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback',
});

class App extends Component {
  render() {
    return (
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <Route path='/' exact={true} component={Home} />
        <Route path='/login/callback' component={LoginCallback} />
      </Security>
    );
  }
}

```

### `SecureRoute`

`SecureRoute` ensures that a route is only rendered if the user is authenticated. If the user is not authenticated, it calls [onAuthRequired](#onauthrequired) if it exists, otherwise, it redirects to Okta.

#### onAuthRequired

`SecureRoute` accepts `onAuthRequired` as an optional prop, it overrides [onAuthRequired](#onauthrequired) from the [Security](#security) component if exists.

#### errorComponent

`SecureRoute` runs internal `handleLogin` process which may throw Error when `authState.isAuthenticated` is false. By default, the Error will be rendered with `OktaError` component. If you wish to customise the display of such error messages, you can pass your own component as an `errorComponent` prop to `<SecureRoute>`.  The error value will be passed to the `errorComponent` as the `error` prop.

#### `react-router` related props
  
`SecureRoute` integrates with `react-router`.  Other routers will need their own methods to ensure authentication using the hooks/HOC props provided by this SDK.

As with `Route` from `react-router-dom`, `<SecureRoute>` can take one of:

- a `component` prop that is passed a component
- a `render` prop that is passed a function that returns a component.  This function will be passed any additional props that react-router injects (such as `history` or `match`)
- children components

### `LoginCallback`

`LoginCallback` handles the callback after the redirect to and back from the Okta-hosted login page. By default, it parses the tokens from the uri, stores them, then redirects to `/`. If a `SecureRoute` caused the redirect, then the callback redirects to the secured route. For more advanced cases, this component can be copied to your own source tree and modified as needed.

#### errorComponent

By default, LoginCallback will display any errors from `authState.error`.  If you wish to customise the display of such error messages, you can pass your own component as an `errorComponent` prop to `<LoginCallback>`.  The `authState.error` value will be passed to the `errorComponent` as the `error` prop.

#### loadingElement

By default, LoginCallback will display nothing during handling the callback. If you wish to customize this, you can pass your React element (not component) as `loadingElement` prop to `<LoginCallback>`. Example: `<p>Loading...</p>`

#### onAuthResume

When an external auth (such as a social IDP) redirects back to your application AND your Okta sign-in policies require additional authentication factors before authentication is complete, the redirect to your application redirectUri callback will be an `interaction_required` error.  

An `interaction_required` error is an indication that you should resume the authentication flow.  You can pass an `onAuthResume` function as a prop to `<LoginCallback>`, and the `<LoginCallback>` will call the `onAuthResume` function when an `interaction_required` error is returned to the redirectUri of your application.  

If using the [Okta SignIn Widget][], redirecting to your login route will allow the widget to automatically resume your authentication transaction.

```jsx
// Example assumes you are using react-router with a customer-hosted Okta SignIn Widget on your /login route
// This code is wherever you have your <Security> component, which must be inside your <Router> for react-router
  const onAuthResume = async () => { 
    history.push('/login');
  };

return (
  <Security
    oktaAuth={oktaAuth}
    restoreOriginalUri={restoreOriginalUri}
  >
    <Switch>
      <SecureRoute path='/protected' component={Protected} />
      <Route path='/login/callback' render={ (props) => <LoginCallback {...props} onAuthResume={ onAuthResume } /> } />
      <Route path='/login' component={CustomLogin} />
      <Route path='/' component={Home} />
    </Switch>
  </Security>
);
```

### `withOktaAuth`

`withOktaAuth` is a [higher-order component][] which injects an [oktaAuth][Okta Auth SDK] instance and an [authState][AuthState] object as props into the component. Function-based components will want to use the `useOktaAuth` hook instead.  These props provide a way for components to make decisions based on [authState][AuthState] or to call [Okta Auth SDK][] methods, such as `.signInWithRedirect()` or `.signOut()`.  Components wrapped in `withOktaAuth()` need to be a child or descendant of a `<Security>` component to have the necessary context.

### `useOktaAuth`

`useOktaAuth()` is a React Hook that returns an object containing the [authState][AuthState] object and the [oktaAuth][Okta Auth SDK] instance.  Class-based components will want to use the [withOktaAuth](#withoktaauth) HOC instead. Using this hook will trigger a re-render when the authState object updates. Components calling this hook need to be a child or descendant of a `<Security>` component to have the necessary context.

#### Using `useOktaAuth`

```jsx
import React from 'react';
import { useOktaAuth } from '@okta/okta-react';

export default MyComponent = () => { 
  const { authState } = useOktaAuth();
  if( !authState ) { 
    return <div>Loading...</div>;
  }
  if( authState.isAuthenticated ) { 
    return <div>Hello User!</div>;
  }
  return <div>You need to login</div>;
};
```

## Migrating between versions

### Migrating from 5.x to 6.x

`@okta/okta-react` 6.x requires `@okta/okta-auth-js` 5.x (see [notes for migration](https://github.com/okta/okta-auth-js/#from-4x-to-5x)). Some changes affects `@okta/okta-react`:
- Initial `AuthState` is null
- Removed `isPending` from `AuthState`
- Default value for `originalUri` is null


### Migrating from 4.x to 5.x

From version 5.0, the Security component explicitly requires prop [restoreOriginalUri](#restoreoriginaluri) to decouple from `react-router`. 
Example of implementation of this callback for `react-router`:

```jsx
import { Security } from '@okta/okta-react';
import { useHistory } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
});

export default App = () => {
  const history = useHistory();
  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
  };

  return (
    <Security
      oktaAuth={oktaAuth}
      restoreOriginalUri={restoreOriginalUri}
    >
      {/* some routes here */}
    </Security>
  );
};
```

**Note:** If you use `basename` prop for `<BrowserRouter>`, use this implementation to fix `basename` duplication problem:
```jsx
  import { toRelativeUrl } from '@okta/okta-auth-js';
  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    const basepath = history.createHref({});
    const originalUriWithoutBasepath = originalUri.replace(basepath, '/');
    history.replace(toRelativeUrl(originalUriWithoutBasepath, window.location.origin));
  };
```

### Migrating from 3.x to 4.x

#### Updating the Security component

From version 4.0, the Security component starts to explicitly accept [oktaAuth][Okta Auth SDK] instance as prop to replace the internal `authService` instance. You will need to replace the [Okta Auth SDK related configurations](https://github.com/okta/okta-auth-js#configuration-reference) with a pre-initialized [oktaAuth][Okta Auth SDK] instance.

##### **Note**

- `@okta/okta-auth-js` is now a peer dependency for this SDK. You must add `@okta/okta-auth-js` as a dependency to your project and install it separately from `@okta/okta-react`.
- [`<Security>`](#security) still accept [onAuthRequired](#onauthrequired) as a prop.

```jsx
import { OktaAuth } from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';

const oktaAuth = new OktaAuth(oidcConfig);
export default () => (
  <Security oktaAuth={oktaAuth} onAuthRequired={customAuthHandler}>
    // children component
  </Security>
);
```

#### Replacing authService instance

The `authService` module has been removed since version 4.0. The [useOktaAuth](#useOktaAuth) hook and [withOktaAuth](#withoktaauth) HOC are exposing `oktaAuth` instead of `authService`.

- Replace `authService` with `oktaAuth` when use [useOktaAuth](#useOktaAuth)

  ```jsx
  import { useOktaAuth } from '@okta/okta-react';

  export default () => {
    const { oktaAuth, authState } = useOktaAuth();
    // handle rest component logic
  };
  ```

- Replace `props.authService` with `props.oktaAuth` when use [withOktaAuth](#withoktaauth)

  ```jsx
  import { withOktaAuth } from '@okta/okta-react';

  export default withOktaAuth((props) => {
    // use props.oktaAuth
  });
  ```

#### Replacing authService public methods

The `oktaAuth` instance exposes similar [public methods](https://github.com/okta/okta-auth-js#api-reference) to handle logic for the removed `authService` module.

- `login` is removed

  This method called `onAuthRequired`, if it was set in the config options, or `redirect` if no `onAuthRequired` option was set. If you had code that was calling this method, you may either call your `onAuthRequired` function directly or `signInWithRedirect`.

- `redirect` is replaced by `signInWithRedirect`

- `logout` is replaced by `signOut`

  `logout` accepted either a string or an object as options. [signOut](https://github.com/okta/okta-auth-js/blob/master/README.md#signout) accepts only an options object.

  If you had code like this:

  ```javascript
  authService.logout('/goodbye');
  ```

  it should be rewritten as:

  ```javascript
  oktaAuth.signOut({ postLogoutRedirectUri: window.location.origin + '/goodbye' });
  ```

  **Note** that the value for `postLogoutRedirectUri` must be an absolute URL. This URL must also be on the "allowed list" in your Okta app's configuration. If no options are passed or no `postLogoutRedirectUri` is set on the options object, it will redirect to `window.location.origin` after sign out is complete.

- `getAccessToken` and `getIdToken` have been changed to synchronous methods

  With maintaining in-memory [AuthState][] since [Okta Auth SDK][] version 4.1, token values can be accessed in synchronous manner.

- `handleAuthentication` is replaced by `handleLoginRedirect`

  `handleLoginRedirect` is called by the `OktaLoginCallback` component as the last step of the login redirect authorization flow. It will obtain and store tokens and then call `restoreOriginalUri` which will return the browser to the `originalUri` which was set before the login redirect flow began.

- `authState` related methods have been collected in [Okta Auth SDK AuthStateManager](https://github.com/okta/okta-auth-js#authstatemanager)
  - Change `authService.updateAuthState` to `oktaAuth.authStateManager.updateAuthState`
  - Change `authService.getAuthState` to `oktaAuth.authStateManager.getAuthState`
  - Change `on` to `oktaAuth.authStateManager.subscribe`
  - `clearAuthState`, `emitAuthState` and `emit` have been removed

- By default `isAuthenticated` will be true if **both** accessToken **and** idToken are valid

  If you have a custom `isAuthenticated` function which implements the default logic, you should remove it.

- `getTokenManager` has been removed

  You may access the `TokenManager` with the `tokenManager` property:

  ```javascript
  const tokens = oktaAuth.tokenManager.getTokens();
  ```

### Migrating from 2.x to 3.x

See [breaking changes for version 3.0](CHANGELOG.md#300)

### Migrating from 1.x to 2.0

The 1.x series for this SDK required the use of [react-router][].  These instructions assume you are moving to version 2.0 of this SDK and are still using React Router (v5+)

#### Replacing Security component

The `<Security>` component is now a generic (not router-specific) provider of Okta context for child components and is required to be an ancestor of any components using the `useOktaAuth` hook, as well as any components using the `withOktaAuth` Higher Order Component.

`Auth.js` has been renamed `AuthService.js`.

The `auth` prop to the `<Security>` component is now `authService`.  The other prop options to `<Security>` have not changed from the 1.x series to the 2.0.x series

#### Replacing the withAuth Higher-Order Component wrapper

This SDK now provides authentication information via React Hooks (see [useOktaAuth](#useOktaAuth)).  If you want a component to receive the auth information as a direct prop to your class-based component, you can use the `withOktaAuth` wrapper where you previously used the `withAuth` wrapper.  The exact props provided have changed to allow for synchronous access to authentication information.  In addition to the `authService` object prop (previously `auth`), there is also an `authState` object prop that has properties for the current authentication state.  

#### Replacing `.isAuthenticated()`, `.getAccessToken()`, and `.getIdToken()` inside a component

Two complications of the 1.x series of this SDK have been simplified in the 2.x series:
- These functions were asynchronous (because the retrieval layer underneath them can be asynchronous) which made avoiding race conditions in renders/re-renders tricky.
- Recognizing when authentication had yet to be decided versus when it had been decided and was not authenticated was an unclear difference between `null`, `true`, and `false`.

To resolve these the `authService` object holds the authentication information and provides it synchronously (following the first async determination) as an `authState` object.  While waiting on that first determination, the `authState` object is null.  When the authentication updates the [authService](#authservice) object will emit an `authStateChange` event after which a new [authState](#authstate) object is available.

Any component that was using `withAuth()` to get the `auth` object and called the properties above has two options to migrate to the new SDK:
1. Replace the use of `withAuth()` with [withOktaAuth()](#withoktaauth), and replace any of these asynchronous calls to the `auth` methods with the values of the related [authState](#authstate) properties. 
**OR**
2. Remove the use of `withAuth()` and instead use the [useOktaAuth()](#useoktaauth) React Hook to get the [authService](#authservice) and [authState](#authstate) objects.  Any use of the `auth` methods (`.isAuthenticated()`, `.getAccessToken()`, and `.getIdToken()`) should change to use the already calculated properties of [authState](#authstate).

To use either of these options, your component must be a descendant of a `<Security>` component, in order to have the necessary context.

These changes should result in less complexity within your components as these values are now synchronously available after the initial determination.

If you need access to the `authService` instance directly, it is provided by [withOktaAuth()](#withoktaauth) as a prop or is available via the [useOktaAuth()](#useoktaauth) React Hook.  You can use the examples in this README to see how to use [authService](#authservice) to perform common tasks such as login/logout, or inspect the provided `<LoginCallback>` component to see an example of the use of the `authService` managing the redirect from the Okta site.  

#### Updating your ImplicitCallback component

- If you were using the provided ImplicitCallback component, you can replace it with `LoginCallback` 
- If you were using a modified version of the provided ImplicitCallback component, you will need to examine the new version to see the changes.  It may be easier to start with a copy of the new LoginCallback component and copy your changes to it.  If you want to use a class-based version of LoginCallback, wrap the component in the [withOktaAuth][] HOC to have the [authService](#authservice) and [authState](#authstate) properties passed as props.
- If you had your own component that handled the redirect-back-to-the-application after authentication, you should examine the new LoginCallback component as well as the notes in this migration section about the changes to `.isAuthenticated()`, `.getAccessToken()`, and `.getIdToken()`.

## Contributing

We welcome contributions to all of our open-source packages. Please see the [contribution guide](https://github.com/okta/okta-react/blob/master/CONTRIBUTING.md) to understand how to structure a contribution.

## Development

### Installing dependencies for contributions

We use [yarn](https://yarnpkg.com) for dependency management when developing this package:

```bash
yarn install
```

### Commands

| Command      | Description                        |
|--------------|------------------------------------|
| `yarn install`| Install dependencies |
| `yarn start` | Start the sample app using the SDK |
| `yarn test`  | Run unit and integration tests     |
| `yarn lint`  | Run eslint linting tests           |

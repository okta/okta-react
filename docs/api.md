# `@okta/okta-react`

## API Reference

* [Security](#security)
* [LoginCallback
](#logincallback)
* [SecureRoute](#secureroute)
* [SecureOutlet](#secureoutlet)
* [useOktaAuth](#useoktaauth)

// TODO TOP anchors
<sub>[ [Top](#api-reference) ]</sub>

## `Security` &nbsp;&nbsp;&nbsp;<sub><sup>

Accepts [oktaAuth][Okta Auth SDK] instance (**required**) and additional [configuration](#configuration-options) as props. This component acts as a [React Context Provider][] that maintains the latest [authState][AuthState] and [oktaAuth][Okta Auth SDK] instance for the downstream consumers. This context can be accessed via the [useOktaAuth](#useoktaauth) React Hook, or the [withOktaAuth](#useoktaauth) Higher Order Component wrapper from it's descendant component.

`<Security>` is the top-most component of okta-react. It accepts [oktaAuth][Okta Auth SDK] instance and addtional configuration options as props.

#### oktaAuth

*(required)* The pre-initialized [oktaAuth][Okta Auth SDK] instance. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference) for details of how to initialize the instance.

#### restoreOriginalUri

*(required)* Callback function. Called to restore original URI during [oktaAuth.handleLoginRedirect()](https://github.com/okta/okta-auth-js#handleloginredirecttokens) is called. Will override [restoreOriginalUri option of oktaAuth](https://github.com/okta/okta-auth-js#restoreoriginaluri). Please use the appropriate navigate functions for your router: [useNavigate](https://reactrouter.com/en/main/hooks/use-navigate) for `react-router 6.x`, [useHistory](https://v5.reactrouter.com/web/api/Hooks/usehistory) for `reat-router 5.x`.

#### onAuthRequired

*(optional)* Callback function. Called when authentication is required. If this is not supplied, `okta-react` redirects to Okta. This callback will receive [oktaAuth][Okta Auth SDK] instance as the first function parameter. This is triggered when a [SecureRoute](#secureroute) or [SecureOutlet](#secureoutlet) is accessed without authentication. A common use case for this callback is to redirect users to a custom login route when authentication is required.

#### Example

```jsx
import { useNavigate } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
});

export default App = () => {
  const navigate = useNavigate();

  const customAuthHandler = React.useCallback((oktaAuth) => {
    // Redirect to the /login page that has a CustomLoginComponent
    // This example is specific to React-Router 6
    history.push('/login');
  }, [navigate]);

  const restoreOriginalUri = React.useCallback(async (_oktaAuth, originalUri) => {
    navigate(toRelativeUrl(originalUri || '/', window.location.origin), { replace: true });
  }, [navigate]);

  return (
    <Security
      oktaAuth={oktaAuth}
      onAuthRequired={customAuthHandler}
      restoreOriginalUri={restoreOriginalUri}
    >
      <Routes>
        <Route path='/login' element={<CustomLoginComponent />} />
        {/* some routes here */}
      </Routes>
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
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login/callback' element={<LoginCallback />} />
        </Routes>
      </Security>
    );
  }
}

```

<sub>[ [Top](#api-reference) ]</sub>

## `LoginCallback`

TODO

```
- A simple component which handles the login callback when the user is redirected back to the application from the Okta login site.  `<LoginCallback>` accepts an optional prop `errorComponent` that will be used to format the output for any error in handling the callback.  This component will be passed an `error` prop that is an error describing the problem.  (see the `<OktaError>` component for the default rendering)

Users of routers other than `react-router` can use [useOktaAuth](#useoktaauth) to see if `authState` is not null and `authState.isAuthenticated` is true.  If it is false, you can send them to login via [oktaAuth.signInWithRedirect()](https://github.com/okta/okta-auth-js#signinwithredirectoptions).  See the implementation of `<LoginCallback>` as an example.
```

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
// Example assumes you are using react-router 6 with a customer-hosted Okta SignIn Widget on your /login route
// This code is wherever you have your <Security> component, which must be inside your <Router> for react-router
const navigate = useNavigate();
const onAuthResume = React.useCallback(async () => { 
  navigate('/login');
}, [navigate]);

return (
  <Security
    oktaAuth={oktaAuth}
    restoreOriginalUri={restoreOriginalUri}
  >
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/protected' element={<SecureOutlet />}>
        <Route path='' element={<Protected />} />
      </Route>
      <Route path='/login/callback' element={<LoginCallback onAuthResume={onAuthResume} />} />
      <Route path='/login' element={<CustomLogin />} />
    </Routes>
  </Security>
);
```

<sub>[ [Top](#api-reference) ]</sub>

## `SecureRoute`

`SecureRoute` ensures that a route is only rendered if the user is authenticated. If the user is not authenticated, it calls [onAuthRequired](#onauthrequired) if it exists, otherwise, it redirects to Okta.

> ⚠️ NOTE ⚠️<br> The [SecureRoute](#secureroute) component packaged in this SDK only works with `react-router-dom` `5.x`.

#### onAuthRequired

`SecureRoute` accepts `onAuthRequired` as an optional prop, it overrides [onAuthRequired](#onauthrequired) from the [Security](#security) component if exists.

#### errorComponent

`SecureRoute` runs internal `handleLogin` process which may throw Error when `authState.isAuthenticated` is false. By default, the Error will be rendered with `OktaError` component. If you wish to customise the display of such error messages, you can pass your own component as an `errorComponent` prop to `<SecureRoute>`.  The error value will be passed to the `errorComponent` as the `error` prop.

#### `react-router` related props
  
`SecureRoute` integrates with `react-router` `5.x`.  Other routers will need their own methods to ensure authentication using the hooks/HOC props provided by this SDK.

As with `Route` from `react-router-dom`, `<SecureRoute>` can take one of:

- a `component` prop that is passed a component
- a `render` prop that is passed a function that returns a component.  This function will be passed any additional props that react-router injects (such as `history` or `match`)
- children components

<sub>[ [Top](#api-reference) ]</sub>

## `SecureOutlet`

`SecureOutlet` is a component for a route that renders its child route elements only if the user is authenticated. If the user is not authenticated, it calls [onAuthRequired](#onauthrequired) if it exists, otherwise, it redirects to Okta.

> ⚠️ NOTE ⚠️<br> The [SecureOutlet](#secureoutlet) component works with `react-router-dom` `6.x`.

Example:
```jsx
<Route path='/protected' element={<SecureOutlet />}>
  <Route path='' element={<Protected />} />
  <Route path='profile' element={<Profile />} />
</Route>
```

#### onAuthRequired

`SecureOutlet` accepts `onAuthRequired` as an optional prop, it overrides [onAuthRequired](#onauthrequired) from the [Security](#security) component if exists.

#### errorComponent

`SecureOutlet` runs internal `handleLogin` process which may throw Error when `authState.isAuthenticated` is false. By default, the Error will be rendered with `OktaError` component. If you wish to customise the display of such error messages, you can pass your own component as an `errorComponent` prop to `<SecureOutlet>`.  The error value will be passed to the `errorComponent` as the `error` prop.

#### loadingElement

By default, `SecureOutlet` will display nothing during redirect to a login page or running `onAuthRequired`. If you wish to customize this, you can pass your React element (not component) as `loadingElement` prop to `<SecureOutlet>`. Example: `<p>Loading...</p>`



<sub>[ [Top](#api-reference) ]</sub>

## `withOktaAuth`

`withOktaAuth` is a [higher-order component][] which injects an [oktaAuth][Okta Auth SDK] instance and an [authState][AuthState] object as props into the component. Function-based components will want to use the `useOktaAuth` hook instead.  These props provide a way for components to make decisions based on [authState][AuthState] or to call [Okta Auth SDK][] methods, such as `.signInWithRedirect()` or `.signOut()`.  Components wrapped in `withOktaAuth()` need to be a child or descendant of a `<Security>` component to have the necessary context.

// TODO revist this
#### Available Hooks

These hooks can be used in a component that is a descendant of a `Security` component (`<Security>` provides the necessary context).  Class-based components can gain access to the same information via the `withOktaAuth` Higher Order Component, which provides `oktaAuth` and `authState` as props to the wrapped component.

- [useOktaAuth](#useoktaauth) - gives an object with two properties:
  - `oktaAuth` - the [Okta Auth SDK][] instance.
  - `authState` - the [AuthState][] object that shows the current authentication state of the user to your app (initial state is `null`).

<sub>[ [Top](#api-reference) ]</sub>

## `useOktaAuth`

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

<sub>[ [Top](#api-reference) ]</sub>
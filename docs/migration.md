# `@okta/okta-react`

## Migration Guide

* [6 to 7](#migrating-from-6x-to-7x)
* [5 to 6](#migrating-from-5x-to-6x)
* [4 to 5](#migrating-from-4x-to-5x)
* [3 to 4](#migrating-from-3x-to-4x)
* [2 to 3](#migrating-from-2x-to-3x)
* [1 to 2](#migrating-from-1x-to-20)

<sub>[ [Top](#examples) ]</sub>

## Migrating from 6.x to 7.x

If you are using `react-router` `5.x` with [SecureRoute](#secureroute), you need to change an import from
```jsx
import { SecureRoute } from '@okta/okta-react';
```
to
```jsx
import { SecureRoute } from '@okta/okta-react/react-router-5';
```

If you are using `react-router` `6.x`, please use [SecureOutlet](#secureoutlet).

<sub>[ [Top](#examples) ]</sub>

## Migrating from 5.x to 6.x

`@okta/okta-react` 6.x requires `@okta/okta-auth-js` 5.x (see [notes for migration](https://github.com/okta/okta-auth-js/#from-4x-to-5x)). Some changes affects `@okta/okta-react`:
- Initial `AuthState` is null
- Removed `isPending` from `AuthState`
- Default value for `originalUri` is null

<sub>[ [Top](#examples) ]</sub>

## Migrating from 4.x to 5.x

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

<sub>[ [Top](#examples) ]</sub>

## Migrating from 3.x to 4.x

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

<sub>[ [Top](#examples) ]</sub>

## Migrating from 2.x to 3.x

See [breaking changes for version 3.0](CHANGELOG.md#300)

<sub>[ [Top](#examples) ]</sub>

## Migrating from 1.x to 2.0

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


<sub>[ [Top](#examples) ]</sub>
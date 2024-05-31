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

:heavy_check_mark: The current stable major version series is: `7.x`

| Version   | Status                           |
| -------   | -------------------------------- |
| `7.x`     | :heavy_check_mark: Stable        |
| `6.x`     | :heavy_check_mark: Stable        |
| `5.x`     | :x: Retired                      |
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
npm install --save @okta/okta-auth-js react
```

See these [samples](https://github.com/okta/okta-react/tree/master/samples/routing) to get started

## Usage

`okta-react` provides the means to connect a React SPA with Okta OIDC integrations. This library the bridge between your React app and [Okta Auth JS](https://github.com/okta/okta-auth-js) instance. Most commonly, you will connect to a router library such as [react-router][].

### SDK Overview
Quick summary of the `okta-react` API. See [API Reference](#reference) for more detailed information

#### Components

- [Security](#security) - A top-level Component and Context Provider which wraps an instance of [Okta Auth JS](https://github.com/okta/okta-auth-js)
- [LoginCallback](#logincallback) - A simple component for handling Authorization Code redirects back to the React app

#### Hooks

- [useOktaAuth](#useoktaauth) - A hook to provide the [Okta Auth JS](https://github.com/okta/okta-auth-js) instance passed to the [Security](#security) Component to low-level components via React Context API

### [React Router](https://reactrouter.com/en/main) Integration APIs

#### Importing
The `react-router` Integration APIs are exposed as separate entrypoints
```js
import { X } from `@okta/okta-react`            // main okta-react API
import { Y } from `@okta/okta-react/router-v5`  // react-router v5 integration API
import { Z } from `@okta/okta-react/router-v6`  // react-router v6 integration API
```

##### `react-router@5.x`

- [SecureRoute](#secureroute) - An extension of `react-router` [Route](https://v5.reactrouter.com/web/api/Route), which requires authentication before rendering

##### `react-router@6.x`

- [SecureOutlet](#secureoutlet) - A wrapper around `react-router` [Outlet](https://reactrouter.com/en/main/components/outlet), which renders a `fallbackElement` until authentication has been completed

// TODO find place for this (mention auth code flow???)
#### Create Routes

This example defines 3 routes:

- **/** - Anyone can access the home page
- **/protected** - Protected is only visible to authenticated users
- **/login/callback** - This is where auth is handled for you after redirection

**Note:** Make sure you have the `/login/callback` url (absolute url) added in your Okta App's configuration.

> A common mistake is to try and apply an authentication requirement to all pages, THEN add an exception for the login page.  This often fails because of how routes are evaluated in most routing packages.  To avoid this problem, declare specific routes or branches of routes that require authentication without exceptions.


## Examples
* [Docs: Examples](./docs/examples.md)

## API Reference
* [Docs: API Reference](./docs/api.md)

## Migration
* [Docs: Migration Guide](./docs/migration.md)

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

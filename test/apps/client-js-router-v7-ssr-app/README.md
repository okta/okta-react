# client-js-router-v7-ssr-app

Sample app demonstrating `@okta/okta-react/client-js` loaders in a [React Router v7 framework-mode](https://reactrouter.com/start/framework/installation) app with SSR enabled (`ssr: true` in `react-router.config.ts`).

The app is server-rendered, but authentication state is entirely browser-held (via `@okta/spa-platform`'s `Credential`/IndexedDB) - there's no server-side session. Every route that needs auth state or a token uses a [`clientLoader`](https://reactrouter.com/how-to/client-data#clientloader) instead of a server `loader`, with `clientLoader.hydrate = true` and a `HydrateFallback` shown while it resolves on first load.

## Routes

- `/` (`app/routes/home.tsx`) - shows a sign in/out button based on whether a `Credential` exists.
- `/protected` (`app/routes/protected.tsx`) - loads and renders ID token claims via `createTokenLoader`.
- `/resource` (`app/routes/resource.tsx`) - fetches `/resource.json` via `createFetchLoader`.
- `/login/callback` (`app/routes/login-callback.tsx`) - resumes the OAuth flow via `createLoginCallbackLoader` and redirects back to the original page. Exports `HydrateFallback` as its `default`, so React Router treats it as a page route rather than a resource route.

`app/auth.ts` exports a single `getAuth()` - a lazy, memoized async singleton. `@okta/spa-platform`'s main entry is a single barrel file: importing any export from it (e.g. `OAuth2Client`) loads the whole module graph, including `Credential`'s own module, which touches the browser-only `location` global on import. `getAuth()` dynamically imports it on first call and is only called from code that runs in the browser (`clientLoader` bodies, event handlers), never from module scope.

## Setup

Requires a `testenv` file at the repo root providing `ISSUER` and `CLIENT_ID` for a test Okta org:

```
CLIENT_ID=<YOUR CLIENT ID>
ISSUER=<YOUR ISSUER URL>
```

The app's redirect URI is `{origin}/login/callback` and its logout redirect is `{origin}/`, so the test org's app configuration needs to allow those for whatever origin you run this on.

```bash
yarn dev    # start the dev server (defaults to http://localhost:8080)
yarn build  # production build
yarn start  # build, then serve via @react-router/serve
```

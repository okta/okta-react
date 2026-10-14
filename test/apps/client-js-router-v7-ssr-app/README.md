# client-js-router-v7-ssr-app

Sample app demonstrating `@okta/okta-react/client-js` loaders in a [React Router v7 framework-mode](https://reactrouter.com/start/framework/installation) app with SSR enabled (`ssr: true` in `react-router.config.ts`).

The app is server-rendered, but authentication state is entirely browser-held (via `@okta/spa-platform`'s `Credential`/IndexedDB) - there's no server-side session. Every route that needs auth state or a token uses a [`clientLoader`](https://reactrouter.com/how-to/client-data#clientloader) instead of a server `loader`, with `clientLoader.hydrate = true` and a `HydrateFallback` shown while it resolves on first load.

## Routes

- `/` (`app/routes/home.tsx`) - shows a sign in/out button based on whether a `Credential` exists.
- `/protected` (`app/routes/protected.tsx`) - loads and renders ID token claims via `createTokenLoader`.
- `/resource` (`app/routes/resource.tsx`) - fetches `/resource.json` via `createFetchLoader`.
- `/login/callback` (`app/routes/login-callback.tsx`) - resumes the OAuth flow via `createLoginCallbackLoader` and redirects back to the original page. Exports `HydrateFallback` as its `default`, so React Router treats it as a page route rather than a resource route.

Construction is split in two: `app/authService.ts` builds the flows and token orchestrator - everything that performs authentication - and `app/dataService.ts` builds the `FetchClient` on top of it. `FetchClient` never authenticates; it only attaches and refreshes tokens the orchestrator already knows how to obtain, so it's a data concern rather than an auth one.

Each exports a lazy, memoized async singleton (`getAuth()` and `getDataService()`). `@okta/spa-platform`'s entry points are barrel files: importing any export (e.g. `OAuth2Client`) loads the whole module graph, including `Credential`'s own module, which touches the browser-only `location` global on import. Both dynamically import it on first call and are only called from code that runs in the browser (`clientLoader` bodies, event handlers), never from module scope.

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
yarn start  # build, then serve via @react-router/serve on port 8080
```

`start` defaults `PORT` to 8080 because `@react-router/serve` otherwise picks its own port (3000, or the next free one). The e2e runner sets `PORT` explicitly, so an override there wins. 8080 isn't arbitrary: the test org registers `http://localhost:8080/login/callback` as this app's only login redirect URI, so serving on another port makes `/authorize` reject the request before the sign-in widget renders.

## e2e tests

Covered by `test/e2e/specs/client-js-router-sample.js`, shared with `client-js-router-v8-app`. From the repo root:

```bash
SAMPLE_NAME=@okta/test.app.client-js-router-v7-ssr-app yarn test:e2e
```

The spec needs `USERNAME` and `PASSWORD` for a user in the test org on top of the `testenv` values above.

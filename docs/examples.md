# `@okta/okta-react`

## Examples

* React Router v5
  * [Routes](#react-router-5-routes-with-class-based-components)
* React Router v6
  * [Routes](#react-router-6-routes-with-function-based-components)
* React Router v6.4+  
  * [Routes](#react-router-64-routes-supporting-data-api-with-function-based-components) w/ Data API
* Toggle Toggle Signin/Signout Buttons
  * [Class](#toggle-signinsignout-buttons-class-based)
  * [Functional](#toggle-signinsignout-buttons-function-based)
* Use the Access Token within Component
  * [Class](#use-the-access-token-within-component-class-based)
  * [Functional](#use-the-access-token-within-component-function-based)

// TODO revisit this
#### Create Routes

This example defines 3 routes:

- **/** - Anyone can access the home page
- **/protected** - Protected is only visible to authenticated users
- **/login/callback** - This is where auth is handled for you after redirection

**Note:** Make sure you have the `/login/callback` url (absolute url) added in your Okta App's configuration.

> A common mistake is to try and apply an authentication requirement to all pages, THEN add an exception for the login page.  This often fails because of how routes are evaluated in most routing packages.  To avoid this problem, declare specific routes or branches of routes that require authentication without exceptions.

<sub>[ [Top](#examples) ]</sub>

### React Router 5 Routes with class-based components

```jsx
// src/App.js

import React, { Component } from 'react';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import { Security, LoginCallback } from '@okta/okta-react';
import { SecureRoute } from '@okta/okta-react/react-router-5';
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

<sub>[ [Top](#examples) ]</sub>

### React Router 6 Routes with function-based components

```jsx
import React from 'react';
import { Security, LoginCallback } from '@okta/okta-react';
import { SecureOutlet } from '@okta/okta-react/react-route-6';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { BrowserRouter as Router, Route, useNavigate } from 'react-router-dom';
import Home from './Home';
import Protected from './Protected';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
});

const App = () => {
  const navigate = useNavigate();
  const restoreOriginalUri = React.useCallback(async (_oktaAuth, originalUri) => {
    navigate(toRelativeUrl(originalUri || '/', window.location.origin), { replace: true });
  }, [navigate]);

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/protected' element={<SecureOutlet />}>
          <Route path='' element={<Protected />} />
        </Route>
        <Route path='/login/callback' element={<LoginCallback />} />
      </Routes>
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

<sub>[ [Top](#examples) ]</sub>

### React Router 6.4+ Routes supporting Data API with function-based components

```jsx
// src/App.js

import React from 'react';
import { Security, LoginCallback } from '@okta/okta-react';
import { SecureOutlet } from '@okta/okta-react/react-route-6';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate } from 'react-router-dom';
import Home from './Home';
import Protected from './Protected';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
});

const Layout = () => {
  const navigate = useNavigate();
  const restoreOriginalUri = React.useCallback((_oktaAuth,  originalUri) => {
    navigate(toRelativeUrl(originalUri || '/', window.location.origin), { replace: true });
  }, [navigate]);

  return (
    <Security
      oktaAuth={oktaAuth}
      restoreOriginalUri={restoreOriginalUri}
    >
      <Outlet />
    </Security>
  );
};

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'login/callback',
        element: <LoginCallback />,
      },
      {
        path: 'protected',
        element: <SecureOutlet />,
        children: [
          {
            path: '',
            element: <Protected />,
          }
        ],
      },
    ],
  }
];

const router = createBrowserRouter(routes);

const AppWithRouterAccess = () => (
  <RouterProvider router={router} />
);

export default AppWithRouterAccess;
```

<sub>[ [Top](#examples) ]</sub>

### Toggle Signin/Signout Buttons (class-based)

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

<sub>[ [Top](#examples) ]</sub>

### Toggle Signin/Signout Buttons (function-based)

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

<sub>[ [Top](#examples) ]</sub>

### Use the Access Token within Component (class-based)

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
          Authorization: 'Bearer ' + this.props.authState.accessToken.accessToken
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

<sub>[ [Top](#examples) ]</sub>

### Use the Access Token within Component (function-based)

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

<sub>[ [Top](#examples) ]</sub>
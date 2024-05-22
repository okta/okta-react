import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';

import config from './config';

const oktaAuth = new OktaAuth(config.oidc);
oktaAuth.start();
oktaAuth.options.restoreOriginalUri = async ()=>{};   // async no-op

const signin = async (path = '') => {
  const originalUri = toRelativeUrl(path ?? window.location.pathname, window.location.origin);
  return oktaAuth.signInWithRedirect({ originalUri });
};

const signout = async () => {
  const didLogout = await oktaAuth.signOut();
  oktaAuth.tokenManager.clear();
  return didLogout;
};

const getUser = async () => {
  const isAuthenticated = await oktaAuth.isAuthenticated();
  if (!isAuthenticated) {
    return null;
  }

  const { idToken } = oktaAuth.tokenManager.getTokensSync();
  // option to call /userinfo as well
  return idToken ? { ...idToken.claims } : null;
  // const userInfo = await oktaAuth.getUser();
  // return userInfo ? { ...userInfo } : null;
};

const getAccessToken = async () => {
  return oktaAuth.getOrRenewAccessToken();
};

const handleAuthCodeCallback = async () => {
  // return await oktaAuth.handleLoginRedirect();
  if (oktaAuth.isLoginRedirect()) {
    const { tokens, state } = await oktaAuth.token.parseFromUrl();
    oktaAuth.tokenManager.setTokens(tokens);
    const originalUri = oktaAuth.getOriginalUri(state);
    return originalUri;
  }
  // throw otherwise
};

export default {
  signin,
  signout,
  getUser,
  getAccessToken,
  handleAuthCodeCallback
  // oktaAuth
};

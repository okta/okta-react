import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { LoginCallback } from '@okta/okta-react';
import { SecureRoute } from './SecureRoute';

import Home from '../pages/Home';
import Protected from '../pages/Protected';

const AppRoutes = () => {
  return (
    <Switch>
      <Route path='/' exact component={Home} />
      <Route path='login/callback' component={LoginCallback} />
      <SecureRoute path='/protected' component={Protected} />
    </Switch>
  );
};

export default AppRoutes;

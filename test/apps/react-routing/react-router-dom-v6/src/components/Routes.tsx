import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginCallback } from '@okta/okta-react';
import { RequiredAuth } from './SecureRoute';

import Home from '../pages/Home';
import Protected from '../pages/Protected';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='login/callback' element={<LoginCallback />} />
      <Route path='/protected' element={<RequiredAuth />}>
        <Route path='' element={<Protected />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

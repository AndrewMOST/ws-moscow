import React from 'react';
import {  BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Main from './Layout/Main';
import Register from './Layout/Register';

export default (
  <Router>
    <Switch>
      <Route exact path='/' component={Register} />
      <Route path='/main' component={Main} />
    </Switch>
  </Router>
);
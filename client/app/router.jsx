import React from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {render} from 'react-dom';
import Application from './components/Application';
import CreateJob from './components/CreateJob';
import JobStatusList from './components/JobStatusList';

export function bootstrap(element) {
  render(
    <Router history={browserHistory}>
      <Route path="/" component={Application}>
        <Route path="job" component={JobStatusList}/>
        <Route path="job/:resultId" component={JobStatusList}/>
        <Route path="new" component={CreateJob}/>
        <Route path="new/:algorithmId" component={CreateJob}/>
      </Route>
    </Router>, element);
}

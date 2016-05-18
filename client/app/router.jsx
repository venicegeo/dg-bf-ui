import React from 'react'
import {createHistory} from 'history'
import {Router, Route, useRouterHistory} from 'react-router'
import {render} from 'react-dom'
import Application from './components/Application'
import Login from './components/Login'
import CreateJob from './components/CreateJob'
import JobStatusList from './components/JobStatusList'
import auth from './utils/auth.js'

function redirectToLogin(nextState, replace) {
  if (!auth.loggedIn()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    })
  }
}

function redirectToDashboard(nextState, replace) {
  if (auth.loggedIn()) {
    replace('/')
  }
}

export function bootstrap(element) {
  const history = useRouterHistory(createHistory)({
    basename: '/'
  })
  render(
    <Router history={history}>
      <Route path="/" component={Application}>
        <Route path="login" component={Login}/>
        <Route path="job" component={JobStatusList} onEnter={redirectToLogin}/>
        <Route path="job/:resultId" component={JobStatusList} onEnter={redirectToLogin}/>
        <Route path="new" component={CreateJob} onEnter={redirectToLogin}/>
        <Route path="new/:algorithmId" component={CreateJob} onEnter={redirectToLogin}/>
      </Route>
    </Router>, element)
}

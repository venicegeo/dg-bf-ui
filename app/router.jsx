import React from 'react'
import {createHistory} from 'history'
import {Router, Route, useRouterHistory, IndexRoute} from 'react-router'
import {render} from 'react-dom'
import Application from './components/Application'
import Login from './components/Login'
import CreateJob from './components/CreateJob'
import JobStatusList from './components/JobStatusList'
import auth from './utils/auth.js'
import Help from './components/Help'
import About from './components/About'

function redirectToLogin(nextState, replace) {
  if (!auth.loggedIn()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname || "/" }
    })
  }
}

function FakeIndex() {
    return <div/>
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
      <Route path="/" component={Application} >
        <IndexRoute component={FakeIndex} onEnter={redirectToLogin}/>
            <Route path="login" component={Login}/>
            <Route path="jobs" component={JobStatusList} onEnter={redirectToLogin}/>
            <Route path="jobs/:resultId" component={JobStatusList} onEnter={redirectToLogin}/>
            <Route path="create-job" component={CreateJob} onEnter={redirectToLogin}/>
            <Route path="help" component={Help} onEnter={redirectToLogin}/>
            <Route path="about" component={About} onEnter={redirectToLogin}/>
      </Route>
    </Router>, element)
}

import React from 'react'
import {createHistory} from 'history'
import {Router, Route, IndexRoute, useRouterHistory} from 'react-router'
import {render} from 'react-dom'
import Application from './components/Application'
import Login from './components/Login'
import CreateJob from './components/CreateJob'
import JobStatusList from './components/JobStatusList'
import Help from './components/Help'
import About from './components/About'
import {isLoggedIn} from './api'

export function bootstrap(element) {
  const history = useRouterHistory(createHistory)({
    basename: '/'
  })
  render(
    <Router history={history}>
      <Route path="/" component={Application}>
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

//
// Internals
//

function redirectToLogin(nextState, replace) {
  if (!isLoggedIn()) {
    replace({
      pathname: '/login',
      state: {
        nextPathname: nextState.location.pathname || '/'
      }
    })
  }
}

function FakeIndex() {
  return <div/>
}

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
        <IndexRoute component={FakeIndex} onEnter={enforceLogin}/>
        <Route path="login" component={Login}/>
        <Route path="jobs" component={JobStatusList} onEnter={enforceLogin}/>
        <Route path="create-job" component={CreateJob} onEnter={enforceLogin}/>
        <Route path="help" component={Help} onEnter={enforceLogin}/>
        <Route path="about" component={About} onEnter={enforceLogin}/>
      </Route>
    </Router>, element)
}

//
// Internals
//

function enforceLogin(nextState, replace) {
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

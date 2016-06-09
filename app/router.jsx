/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'
import {createHistory} from 'history'
import {Router, Route, IndexRoute, useRouterHistory} from 'react-router'
import {Provider} from 'react-redux'
import {render} from 'react-dom'
import Application from './components/Application'
import Login from './components/Login'
import CreateJob from './components/CreateJob'
import JobStatusList from './components/JobStatusList'
import Help from './components/Help'
import About from './components/About'
import store from './store'

export function bootstrap(element) {
  const history = useRouterHistory(createHistory)({
    basename: '/'
  })
  render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={Application}>
          <IndexRoute component={FakeIndex} onEnter={enforceLogin}/>
          <Route path="login" component={Login}/>
          <Route path="jobs" component={JobStatusList} onEnter={enforceLogin}/>
          <Route path="create-job" component={CreateJob} onEnter={enforceLogin}/>
          <Route path="create-job/:bbox" component={CreateJob} onEnter={enforceLogin}/>
          <Route path="help" component={Help} onEnter={enforceLogin}/>
          <Route path="about" component={About} onEnter={enforceLogin}/>
        </Route>
      </Router>
    </Provider>, element)
}

//
// Internals
//

function enforceLogin(nextState, replace) {
  if (!store.getState().login.authToken) {
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

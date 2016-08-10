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

import {applyMiddleware, createStore, combineReducers, compose} from 'redux'
import thunkMiddleware from 'redux-thunk'
import debounce from 'lodash/debounce'
import * as algorithms from './reducers/algorithms'
import * as authentication from './reducers/authentication'
import * as catalog from './reducers/catalog'
import * as detections from './reducers/detections'
import * as draftJob from './reducers/draftJob'
import * as executor from './reducers/executor'
import * as geoserver from './reducers/geoserver'
import * as imagery from './reducers/imagery'
import * as jobs from './reducers/jobs'
import * as search from './reducers/search'
import * as workers from './reducers/workers'

const beachfrontApp = combineReducers({
  algorithms:     algorithms.reducer,
  authentication: authentication.reducer,
  catalog:        catalog.reducer,
  detections:     detections.reducer,
  draftJob:       draftJob.reducer,
  executor:       executor.reducer,
  geoserver:      geoserver.reducer,
  imagery:        imagery.reducer,
  jobs:           jobs.reducer,
  search:         search.reducer,
  workers:        workers.reducer,
})

let devtoolsExtension = f => f
if (process.env.NODE_ENV === 'development') {
  if (typeof window.devToolsExtension === 'function') {
    devtoolsExtension = window.devToolsExtension()
  }
}

export function configureStore(initialState) {
  const store = createStore(beachfrontApp, {...deserializeState(), ...initialState},
    compose(
      applyMiddleware(thunkMiddleware),
      devtoolsExtension
    )
  )
  store.subscribe(debounce(() => serializeState(store.getState()), 1000))
  return store
}

//
// Internals
//

function deserializeState() {
  try {
    return {
      authentication: authentication.deserialize(),
      catalog: catalog.deserialize(),
      draftJob: draftJob.deserialize(),
      executor: executor.deserialize(),
      geoserver: geoserver.deserialize(),
      imagery: imagery.deserialize(),
      jobs: jobs.deserialize(),
      search: search.deserialize(),
    }
  } catch (err) {
    // TODO -- on 2x failure, prompt user to do a "hard reset"
    console.error('(store:deserializeState) Could not deserialize state tree', err)
  }
}

function serializeState(state) {
  try {
    authentication.serialize(state.authentication)
    catalog.serialize(state.catalog)
    draftJob.serialize(state.draftJob)
    executor.serialize(state.executor)
    geoserver.serialize(state.geoserver)
    imagery.serialize(state.imagery)
    jobs.serialize(state.jobs)
    search.serialize(state.search)
  } catch (err) {
    console.error('(store:serializeState) Could not serialize state tree', err)
  }
}

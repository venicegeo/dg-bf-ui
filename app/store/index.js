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
import moment from 'moment'
import debounce from 'lodash/debounce'

import {
  LOG_IN,
  LOG_IN_SUCCESS,
  LOG_IN_ERROR,

  ALGORITHMS_WORKER_ERROR,
  FETCH_ALGORITHMS,
  FETCH_ALGORITHMS_SUCCESS,
  START_ALGORITHMS_WORKER,
  STOP_ALGORITHMS_WORKER,

  CLEAR_IMAGE_SEARCH_RESULTS,
  SEARCH_IMAGE_CATALOG,
  SEARCH_IMAGE_CATALOG_ERROR,
  SEARCH_IMAGE_CATALOG_SUCCESS,
  SELECT_IMAGE,
  UPDATE_IMAGE_SEARCH_BBOX,
  UPDATE_IMAGE_SEARCH_DATES,
  UPDATE_IMAGE_CATALOG_API_KEY,

  CREATE_JOB,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  DISCOVER_SERVICE,
  DISCOVER_SERVICE_ERROR,
  DISCOVER_SERVICE_SUCCESS,
  FETCH_JOBS,
  FETCH_JOBS_SUCCESS,
  JOBS_WORKER_ERROR,
  START_JOBS_WORKER,
  STOP_JOBS_WORKER,
  UPDATE_JOB,

  LOAD_RESULT,
  LOAD_RESULT_SUCCESS,
  LOAD_RESULT_ERROR,
  LOAD_RESULT_PROGRESSED,
  UNLOAD_RESULT
} from '../actions'

function algorithms(state = {
  fetching: false,
  records: []
}, action) {
  switch (action.type) {
  case FETCH_ALGORITHMS:
    return {...state, fetching: true}
  case FETCH_ALGORITHMS_SUCCESS:
    return {...state, fetching: false, records: action.records}
  default:
    return state
  }
}

function criteria(state = {
  bbox: null,
  dateFrom: moment().subtract(30, 'days').format('YYYY-MM-DD'),
  dateTo: moment().format('YYYY-MM-DD')
}, action) {
  switch (action.type) {
  case UPDATE_IMAGE_SEARCH_BBOX:
    return {
      ...state,
      bbox: action.bbox
    }
  case UPDATE_IMAGE_SEARCH_DATES:
    return {
      ...state,
      dateFrom: action.dateFrom,
      dateTo: action.dateTo
    }
  default:
    return state
  }
}

const INITIAL_IMAGERY = {
  catalogApiKey: null,
  search: {
    criteria: criteria(undefined, {}),
    results: null,
    searching: false
  },
  selection: null,
  error: null
}

function imagery(state = INITIAL_IMAGERY, action) {
  switch (action.type) {
  case UPDATE_IMAGE_CATALOG_API_KEY:
    return {...state, catalogApiKey: action.value}
  case UPDATE_IMAGE_SEARCH_BBOX:
  case UPDATE_IMAGE_SEARCH_DATES:
    return {
      ...state,
      search: {
        ...state.search,
        criteria: criteria(state.search.criteria, action)
      }
    }
  case CLEAR_IMAGE_SEARCH_RESULTS:
    return {...state, search: {...state.search, results: null}}
  case SEARCH_IMAGE_CATALOG:
    return {...state, search: {...state.search, searching: true}, error: null}
  case SEARCH_IMAGE_CATALOG_SUCCESS:
    return {...state, search: {...state.search, searching: false, results: action.results}}
  case SEARCH_IMAGE_CATALOG_ERROR:
    return {...state, search: {...state.search, searching: false}, error: action.err}
  case SELECT_IMAGE:
    return {...state, selection: action.feature}
  case CREATE_JOB_SUCCESS:
    return {...state, selection: null}
  default:
    return state
  }
}

const INITIAL_JOBS = {
  serviceId: null,
  creating: false,
  discovering: false,
  fetching: false,
  records: [],
  error: null
}

function jobs(state = INITIAL_JOBS, action) {
  switch (action.type) {
  case DISCOVER_SERVICE:
    return {...state, discovering: true}
  case DISCOVER_SERVICE_SUCCESS:
    return {...state, discovering: false, serviceId: action.serviceId}
  case DISCOVER_SERVICE_ERROR:
    return {...state, discovering: false, error: action.err}
  case FETCH_JOBS:
    return {...state, fetching: true}
  case FETCH_JOBS_SUCCESS:
    return {...state, fetching: false, records: action.records}
  case CREATE_JOB:
    return {...state, creating: true}
  case CREATE_JOB_SUCCESS:
    return {...state, creating: false, records: state.records.concat(action.record)}
  case CREATE_JOB_ERROR:
    return {...state, creating: false, error: action.err}
  case UPDATE_JOB:
    return {...state, records: state.records.map(job => {
      if (job.id === action.jobId) {
        return {...job, status: action.status, resultId: action.resultId}
      }
      return job
    })}
  default:
    return state
  }
}

const INITIAL_LOGIN = {
  authToken: null,
  verifying: false,
  error: null
}

function login(state = INITIAL_LOGIN, action) {
  switch (action.type) {
  case LOG_IN:
    return {...state, verifying: true, error: null}
  case LOG_IN_SUCCESS:
    return {...state, verifying: false, error: null, authToken: action.token}
  case LOG_IN_ERROR:
    return {...state, verifying: false, error: action.err}
  default:
    return state
  }
}

function results(state = {}, action) {
  const {jobId} = action
  switch (action.type) {
  /*
   Caching for results needs to live in the action creator.  Because of the potentially huge
   size of the GeoJSON, keeping that in the state tree is probably a bad idea.
   */
  case LOAD_RESULT:
    return {...state, [jobId]: {loading: true}}
  case LOAD_RESULT_SUCCESS:
    return {...state, [jobId]: {...state[jobId], loading: false, geojson: action.geojson}}
  case LOAD_RESULT_ERROR:
    return {...state, [jobId]: {...state[jobId], loading: false, error: action.err}}
  case LOAD_RESULT_PROGRESSED:
    return {...state, [jobId]: {...state[jobId], progress: {loaded: action.loaded, total: action.total}}}
  case UNLOAD_RESULT:
    return {...state, [jobId]: undefined}
  default:
    return state
  }
}

function workers(state = {
  algorithms: {
    running: false,
    error: null
  },
  jobs: {
    running: false,
    error: null
  }
}, action) {
  switch (action.type) {
  case ALGORITHMS_WORKER_ERROR:
    return {...state, algorithms: {...state.algorithms, error: action.err}}
  case START_ALGORITHMS_WORKER:
    return {...state, algorithms: {running: true, error: null}}
  case STOP_ALGORITHMS_WORKER:
    return {...state, algorithms: {...state.algorithms, running: false}}
  case JOBS_WORKER_ERROR:
    return {...state, jobs: {...state.jobs, error: action.err}}
  case START_JOBS_WORKER:
    return {...state, jobs: {running: true, error: null}}
  case STOP_JOBS_WORKER:
    return {...state, jobs: {...state.jobs, running: false}}
  default:
    return state
  }
}

const beachfrontApp = combineReducers({
  algorithms,
  imagery,
  jobs,
  login,
  results,
  workers
})

let devtoolsExtension = f => f
if (process.env.NODE_ENV === 'development') {
  if (typeof window.devToolsExtension === 'function') {
    devtoolsExtension = window.devToolsExtension()
  }
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  // sessionStorage.setItem('jobs', JSON.stringify([
  //   {
  //     algorithmName: 'test-algo-id',
  //     createdOn: new Date().toISOString(),
  //     id: 'indonesia',
  //     name: 'Indonesia Fixture',
  //     resultId: 'indonesia.geojson',
  //     status: 'Success',
  //     bbox: [110, 1, 112, -1]
  //   },
  //   {
  //     algorithmName: 'test-algo-id',
  //     createdOn: new Date(Date.now() - 3 * (24 * 60 * 60 * 1000)).toISOString(),
  //     id: 'perth',
  //     name: 'Perth Fixture',
  //     resultId: 'perth.geojson',
  //     status: 'Success',
  //     bbox: [115.4, -32.52, 116.06, -31.88]
  //   },
  //   {
  //     algorithmName: 'test-algo-id',
  //     createdOn: new Date(0).toISOString(),
  //     id: '_stalled',
  //     name: 'Stalled Fixture',
  //     status: 'Running',
  //     bbox: [0, 0, 3, 3]
  //   }
  // ]))
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
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
      login: {
        ...INITIAL_LOGIN,
        authToken: sessionStorage.getItem('state.login.authToken')
      },
      imagery: {
        ...INITIAL_IMAGERY,
        catalogApiKey: localStorage.getItem('state.imagery.catalogApiKey'),
        search: {
          ...INITIAL_IMAGERY.search,
          criteria: {
            ...INITIAL_IMAGERY.search.criteria,
            ...JSON.parse(sessionStorage.getItem('state.imagery.search.criteria'))
          }
        }
      },
      jobs: {
        ...INITIAL_JOBS,
        records: JSON.parse(localStorage.getItem('state.jobs.records')) || []
      }
    }
  } catch (err) {
    // TODO -- on 2x failure, prompt user to do a "hard reset"
    console.error('(store:deserializeState) Could not deserialize state tree', err)
  }
}

function serializeState(state) {
  try {
    // Permanent
    localStorage.setItem('state.imagery.catalogApiKey', state.imagery.catalogApiKey)
    localStorage.setItem('state.jobs.records', JSON.stringify(state.jobs.records))

    // Transient
    sessionStorage.setItem('state.login.authToken', JSON.stringify(state.login.authToken))
    sessionStorage.setItem('state.imagery.search.criteria', JSON.stringify(state.imagery.search.criteria))
    sessionStorage.setItem('state.imagery.selection', JSON.stringify(state.imagery.selection))
  } catch (err) {
    console.error('(store:serializeState) Could not serialize state tree', err)
  }
}

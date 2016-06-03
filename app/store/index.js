import {applyMiddleware, createStore, combineReducers} from 'redux'
import thunkMiddleware from 'redux-thunk'

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

  CREATE_JOB,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
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

function imagery(state = {
  searching: false,
  searchResults: null,
  selection: null,
  error: null
}, action) {
  switch (action.type) {
  case CLEAR_IMAGE_SEARCH_RESULTS:
    return {...state, searchResults: null}
  case SEARCH_IMAGE_CATALOG:
    return {...state, searching: true, error: null}
  case SEARCH_IMAGE_CATALOG_SUCCESS:
    return {...state, searching: false, searchResults: action.results}
  case SEARCH_IMAGE_CATALOG_ERROR:
    return {...state, searching: false, error: action.err}
  case SELECT_IMAGE:
    return {...state, selection: action.feature}
  default:
    return state
  }
}

function jobs(state = {
  creating: false,
  fetching: false,
  records: JSON.parse(sessionStorage.getItem('jobs')) || [],
  error: null
}, action) {
  switch (action.type) {
  case FETCH_JOBS:
    return {...state, fetching: true}
  case FETCH_JOBS_SUCCESS:
    return {...state, fetching: false, records: action.records}
  case CREATE_JOB_SUCCESS:
    return {...state, creating: false, records: state.records.concat(action.record)}
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

function login(state = {
  authToken: sessionStorage.getItem('authToken'),
  verifying: false,
  error: null
}, action) {
  switch (action.type) {
  case LOG_IN:
    return {...state, verifying: true, error: null}
  case LOG_IN_SUCCESS:
    sessionStorage.setItem('authToken', action.token)
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
  case LOAD_RESULT:
    return {...state, [jobId]: {...state[jobId], loading: true}}
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

export default applyMiddleware(thunkMiddleware)(createStore)(beachfrontApp)

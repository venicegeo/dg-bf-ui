import {applyMiddleware, createStore, combineReducers} from 'redux'
import thunkMiddleware from 'redux-thunk'

import {
  LOG_IN,
  LOG_IN_SUCCESS,
  LOG_IN_ERROR,

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
    return {...state, verifying: false, error: action.message}
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
    return {...state, [jobId]: {...state[jobId], loading: false, error: action.message}}
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
  case JOBS_WORKER_ERROR:
    return {...state, jobs: {...state.jobs, error: action.message}}
  case START_JOBS_WORKER:
    return {...state, jobs: {running: true, error: null}}
  case STOP_JOBS_WORKER:
    return {...state, jobs: {...state.jobs, running: false}}
  default:
    return state
  }
}

function jobs(state = {
  fetching: false,
  records: JSON.parse(sessionStorage.getItem('jobs')) || []
}, action) {
  switch (action.type) {
  case FETCH_JOBS:
    return {...state, fetching: true}
  case FETCH_JOBS_SUCCESS:
    return {...state, fetching: false, records: action.records}
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

const beachfrontApp = combineReducers({
  login,
  jobs,
  results,
  workers
})

export default applyMiddleware(thunkMiddleware)(createStore)(beachfrontApp)

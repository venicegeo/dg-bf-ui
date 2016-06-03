import {applyMiddleware, createStore, combineReducers} from 'redux'
import thunkMiddleware from 'redux-thunk'

import {
  LOG_IN,
  AUTH_TOKEN_RECEIVED,
  AUTHENTICATION_FAILED,

  FETCH_JOBS,
  JOB_CREATED,
  JOB_CREATION_FAILED,
  JOBS_WORKER_ERROR,
  JOBS_WORKER_STARTED,
  JOBS_WORKER_STOPPED,
  RECEIVE_JOBS,
  UPDATE_JOB
} from '../actions'

function login(state = {
  authToken: sessionStorage.getItem('authToken'),
  verifying: false,
  error: null
}, action) {
  switch (action.type) {
  case LOG_IN:
    return {...state, verifying: true, error: null}
  case AUTH_TOKEN_RECEIVED:
    sessionStorage.setItem('authToken', action.token)
    return {...state, verifying: false, error: null, authToken: action.token}
  case AUTHENTICATION_FAILED:
    return {...state, verifying: false, error: action.message}
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
  case JOBS_WORKER_STARTED:
    return {...state, jobs: {running: true, error: null}}
  case JOBS_WORKER_STOPPED:
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
  case RECEIVE_JOBS:
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
  workers
})

export default applyMiddleware(thunkMiddleware)(createStore)(beachfrontApp)

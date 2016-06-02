import {applyMiddleware, createStore, combineReducers} from 'redux'
import thunkMiddleware from 'redux-thunk'

import {
  LOG_IN,
  AUTH_TOKEN_RECEIVED,
  AUTHENTICATION_FAILED,
  FETCH_JOBS,
  RECEIVE_JOBS,
  JOB_CREATED,
  JOB_CREATION_FAILED
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

function jobs(state = {
  fetching: false,
  records: JSON.parse(sessionStorage.getItem('jobs')) || []
}, action) {
  switch (action.type) {
  case FETCH_JOBS:
    return {...state, fetching: true}
  case RECEIVE_JOBS:
    return {...state, fetching: false, records: action.records}
  default:
    return state
  }
}

const beachfrontApp = combineReducers({
  login,
  jobs
})

export default applyMiddleware(thunkMiddleware)(createStore)(beachfrontApp)

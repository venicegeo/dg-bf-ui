import {applyMiddleware, createStore, combineReducers} from 'redux'
import thunkMiddleware from 'redux-thunk'

import {
  REQUEST_AUTH_TOKEN,
  AUTH_TOKEN_RECEIVED,
  AUTHENTICATION_FAILED,
  FETCH_JOBS,
  RECEIVE_JOBS
} from '../actions'

function login(state = {
  authToken: sessionStorage.getItem('authToken'),
  authenticating: false,
  error: false
}, action) {
  switch (action.type) {
  case AUTH_TOKEN_RECEIVED:
    sessionStorage.setItem('authToken', action.token)
    return {...state, authenticating: false, authToken: action.token}
  case REQUEST_AUTH_TOKEN:
    return {...state, authenticating: true}
  case AUTHENTICATION_FAILED:
    return {...state, authenticating: false, error: true}
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

export const LOG_IN = 'LOG_IN'
export const AUTH_TOKEN_RECEIVED = 'AUTH_TOKEN_RECEIVED'
export const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED'

export const FETCH_JOBS = 'FETCH_JOBS'
export const RECEIVE_JOBS = 'RECEIVE_JOBS'

import {GATEWAY} from '../config'

export function logIn(username, password) {
  return dispatch => {
    dispatch({type: LOG_IN})
    return fetch(GATEWAY.replace('pz-gateway.', 'pz-security.') + '/verification', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({username, credential: password})
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HttpError (code=${response.status})`)
        }
        return response.text()
      })
      .then(token => {
        
        // HACK HACK HACK HACK
        if (token === 'false') {
          dispatch({type: AUTHENTICATION_FAILED, message: 'Credentials rejected'})
          return
        }
        token = `Basic ${btoa(username + ':' + password)}`
        // HACK HACK HACK HACK
        
        dispatch({type: AUTH_TOKEN_RECEIVED, token})
      })
      .catch(err => {
        dispatch({type: AUTHENTICATION_FAILED, message: err.toString()})
      })
  }
}

import {GATEWAY} from '../config'

//
// Action Types
//

export const LOG_IN = 'LOG_IN'
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'
export const LOG_IN_ERROR = 'LOG_IN_ERROR'

//
// Action Creators
//

export function logIn(username, password) {
  return dispatch => {
    dispatch({
      type: LOG_IN
    })
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
          dispatch(logInError('Credentials rejected'))
          return
        }
        token = `Basic ${btoa(username + ':' + password)}`
        // HACK HACK HACK HACK

        dispatch(logInSuccess(token))
      })
      .catch(err => {
        dispatch(logInError(err.toString()))
      })
  }
}

function logInError(message) {
  return {
    type: LOG_IN_ERROR,
    message
  }
}

function logInSuccess(token) {
  return {
    type: LOG_IN_SUCCESS,
    token
  }
}

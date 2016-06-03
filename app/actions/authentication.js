import {GATEWAY} from '../config'

export const LOG_IN = 'LOG_IN'
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'
export const LOG_IN_ERROR = 'LOG_IN_ERROR'

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
          dispatch({
            type: LOG_IN_ERROR,
            message: 'Credentials rejected'
          })
          return
        }
        token = `Basic ${btoa(username + ':' + password)}`
        // HACK HACK HACK HACK

        dispatch({
          type: LOG_IN_SUCCESS,
          token
        })
      })
      .catch(err => {
        dispatch({
          type: LOG_IN_ERROR,
          message: err.toString()
        })
      })
  }
}

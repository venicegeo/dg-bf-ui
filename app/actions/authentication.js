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
        dispatch(logInError(err))
      })
  }
}

function logInError(err) {
  return {
    type: LOG_IN_ERROR,
    err
  }
}

function logInSuccess(token) {
  return {
    type: LOG_IN_SUCCESS,
    token
  }
}

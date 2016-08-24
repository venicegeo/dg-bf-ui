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

export const AUTHENTICATE = 'AUTHENTICATE'
export const AUTHENTICATE_SUCCESS = 'AUTHENTICATE_SUCCESS'
export const AUTHENTICATE_ERROR = 'AUTHENTICATE_ERROR'

//
// Action Creators
//

export function authenticate(username, password) {
  return dispatch => {
    dispatch({
      type: AUTHENTICATE
    })

    return fetch(GATEWAY + '/key', {
      method:  'GET',
      headers: {
        'Authorization': `Basic ${btoa(username + ':' + password)}`
      },
    })
      .then(response => {
        if (!response.ok) {
          throw httpError(response)
        }
        return response.json()
      })
      .then(auth => {
        if (!auth.uuid) {
          dispatch(authenticateError('Credentials rejected'))
          return
        }
        const token = `Basic ${btoa(auth.uuid + ':')}`

        dispatch(authenticateSuccess(token))
      })
      .catch(err => {
        dispatch(authenticateError(err))
      })
  }
}

function authenticateError(err) {
  return {
    type: AUTHENTICATE_ERROR,
    err
  }
}

function authenticateSuccess(token) {
  return {
    type: AUTHENTICATE_SUCCESS,
    token
  }
}

//
// Helpers
//

function httpError(response) {
  const err = new Error(`HttpError (code=${response.status})`)
  return Object.assign(err, {
    message: err.message,
    stack: err.stack,
    code: response.status,
  })
}
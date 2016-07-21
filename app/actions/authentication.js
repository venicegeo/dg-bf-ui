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

    const encodedCreds = encode(username, password)
    //return fetch(GATEWAY+ '/key', {
    return fetch('https://pz-gateway.int.geointservices.io/key', {
     // return fetch(GATEWAY.replace('pz-gateway.', 'pz-security.') + '/verification', {
      method: 'GET',
      headers: {'Authorization' : 'Basic ' + encodedCreds},
      //body: JSON.stringify({username, credential: password})
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HttpError (code=${response.status})`)
        }
        return response.json()
      })
      .then(token => {

        const uuid = token.uuid
        // HACK HACK HACK HACK
        if (token === 'false') {
          dispatch(authenticateError('Credentials rejected'))
          return
        }
        const encodedUuid = encode(uuid, '')
        token = encodedUuid
        //token = `Basic ${btoa(uuid + ':')}`
        // HACK HACK HACK HACK

        dispatch(authenticateSuccess(token))
        console.log('success')
      })
      .catch(err => {
        dispatch(authenticateError(err))
      })
  }
}

function encode(username, password){
  const decodedString = username + ":" + password;
  const encodedValue = b64EncodeUnicode(decodedString);
  return encodedValue

}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
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

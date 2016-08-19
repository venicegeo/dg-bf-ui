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

import {
  AUTHENTICATE,
  AUTHENTICATE_SUCCESS,
  AUTHENTICATE_ERROR,
} from '../../actions/authentication'

const INITIAL_STATE = {
  authenticating: false,
  error: null,
  token: null,
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case AUTHENTICATE:
    return Object.assign({}, state, {
      authenticating: true,
    })
  case AUTHENTICATE_SUCCESS:
    return Object.assign({}, state, {
      authenticating: false,
      error:          null,
      token:          action.token,
    })
  case AUTHENTICATE_ERROR:
    return Object.assign({}, state, {
      authenticating: false,
      error:          action.err,
      token:          null,
    })
  default:
    return state
  }
}

export function deserialize() {
  return Object.assign({}, INITIAL_STATE, {
    token: sessionStorage.getItem('authentication_token') || INITIAL_STATE.token,
  })
}

export function serialize(state) {
  sessionStorage.setItem('authentication_token', state.token)
}

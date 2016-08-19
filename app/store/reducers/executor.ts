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
  DISCOVER_EXECUTOR,
  DISCOVER_EXECUTOR_SUCCESS,
  DISCOVER_EXECUTOR_ERROR,
} from '../../actions/executor'

const INITIAL_STATE = {
  discovering: false,
  serviceId:   null,
  url:         null,
  error:       null,
}

export function reducer(state: TypeState = INITIAL_STATE, action): TypeState {
  switch (action.type) {
  case DISCOVER_EXECUTOR:
    return Object.assign({}, state, {
      discovering: true,
    })
  case DISCOVER_EXECUTOR_SUCCESS:
    return Object.assign({}, state, {
      discovering: false,
      serviceId: action.serviceId,
      url: action.url,
    })
  case DISCOVER_EXECUTOR_ERROR:
    return Object.assign({}, state, {
      discovering: false,
      error: action.err,
    })
  default:
    return state
  }
}

export function deserialize() {
  return Object.assign({}, INITIAL_STATE, {
    serviceId: sessionStorage.getItem('executor_serviceId') || INITIAL_STATE.serviceId,
    url: sessionStorage.getItem('executor_url') || INITIAL_STATE.url,
  })
}

export function serialize(state) {
  sessionStorage.setItem('executor_serviceId', state.serviceId || '')
  sessionStorage.setItem('executor_url', state.url || '')
}

export interface TypeState {
  discovering: boolean
  serviceId: string
  url: string
  error: any
}

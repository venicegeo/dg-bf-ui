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
  DISCOVER_GEOSERVER,
  DISCOVER_GEOSERVER_SUCCESS,
  DISCOVER_GEOSERVER_ERROR,
} from '../../actions/geoserver'

const INITIAL_STATE = {
  baselineLayerId: null,
  discovering: false,
  url: null,
  error: null,
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case DISCOVER_GEOSERVER:
    return Object.assign({}, state, {
      discovering: true,
    })
  case DISCOVER_GEOSERVER_SUCCESS:
    return Object.assign({}, state, {
      discovering:     false,
      baselineLayerId: action.baselineLayerId,
      url:             action.url,
    })
  case DISCOVER_GEOSERVER_ERROR:
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
    baselineLayerId: sessionStorage.getItem('geoserver_baselineLayerId') || INITIAL_STATE.baselineLayerId,
    url: sessionStorage.getItem('geoserver_url') || INITIAL_STATE.url,
  })
}

export function serialize(state) {
  sessionStorage.setItem('geoserver_url', state.url || '')
  sessionStorage.setItem('geoserver_baselineLayerId', state.baselineLayerId || '')
}

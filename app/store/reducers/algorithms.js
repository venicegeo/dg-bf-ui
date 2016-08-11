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
  FETCH_ALGORITHMS,
  FETCH_ALGORITHMS_SUCCESS,
} from '../../actions/algorithms'

const INITIAL_STATE = {
  fetching: false,
  records: []
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case FETCH_ALGORITHMS:
    return {
      ...state,
      fetching: true
    }
  case FETCH_ALGORITHMS_SUCCESS:
    return {
      ...state,
      fetching: false,
      records: action.records
    }
  default:
    return state
  }
}

export function deserialize() {
  return Object.assign({}, INITIAL_STATE, {
    records: JSON.parse(localStorage.getItem('algorithms_records')) || INITIAL_STATE.records,
  })
}

export function serialize(state) {
  localStorage.setItem('algorithms_records', JSON.stringify(state.records))
}
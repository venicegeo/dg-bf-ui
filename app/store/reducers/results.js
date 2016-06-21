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
  LOAD_RESULT,
  LOAD_RESULT_SUCCESS,
  LOAD_RESULT_ERROR,
  LOAD_RESULT_PROGRESSED,
  UNLOAD_RESULT
} from '../../actions/results'

export function reducer(state = {}, action) {
  const {jobId} = action
  switch (action.type) {
  case LOAD_RESULT:
    return {
      ...state,
      [jobId]: {
        loading: true
      }
    }
  case LOAD_RESULT_SUCCESS:
    return {
      ...state, [jobId]: {
        ...state[jobId],
        loading: false,
        geojson: action.geojson
      }
    }
  case LOAD_RESULT_ERROR:
    return {
      ...state, [jobId]: {
        ...state[jobId],
        loading: false,
        error: action.err
      }
    }
  case LOAD_RESULT_PROGRESSED:
    return {
      ...state, [jobId]: {
        ...state[jobId],
        progress: {
          loaded: action.loaded,
          total: action.total
        }
      }
    }
  case UNLOAD_RESULT:
    return {
      ...state, [jobId]: undefined
    }
  default:
    return state
  }
}

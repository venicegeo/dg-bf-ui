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

import {combineReducers} from 'redux'

import {
  ALGORITHMS_WORKER_ERROR,
  START_ALGORITHMS_WORKER,
  STOP_ALGORITHMS_WORKER,
} from '../../actions/algorithms'
import {
  DISMISS_JOB_ERROR,
  JOBS_WORKER_ERROR,
  START_JOBS_WORKER,
  STOP_JOBS_WORKER,
} from '../../actions/jobs'

function algorithms(state: TypeState = {
  error:   null,
  running: false,
}, action): TypeState {
  switch (action.type) {
  case ALGORITHMS_WORKER_ERROR:
    return Object.assign({}, state, {
      error: action.err,
    })
  case START_ALGORITHMS_WORKER:
    return Object.assign({}, state, {
      running: true,
    })
  case STOP_ALGORITHMS_WORKER:
    return Object.assign({}, state, {
      running: false,
    })
  default:
    return state
  }
}

function jobs(state: TypeState = {
  error:   null,
  running: false,
}, action): TypeState {
  switch (action.type) {
  case DISMISS_JOB_ERROR:
    return Object.assign({}, state, {
      error: null,
    })
  case JOBS_WORKER_ERROR:
    return Object.assign({}, state, {
      error: action.err,
    })
  case START_JOBS_WORKER:
    return Object.assign({}, state, {
      running: true,
    })
  case STOP_JOBS_WORKER:
    return Object.assign({}, state, {
      running: false,
    })
  default:
    return state
  }
}

export const reducer = combineReducers({
  algorithms,
  jobs,
})

export interface TypeState {
  error: any
  running: boolean
}

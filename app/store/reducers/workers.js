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
  ALGORITHMS_WORKER_ERROR,
  START_ALGORITHMS_WORKER,
  STOP_ALGORITHMS_WORKER,
} from '../../actions/algorithms'
import {
  JOBS_WORKER_ERROR,
  START_JOBS_WORKER,
  STOP_JOBS_WORKER,
} from '../../actions/jobs'

export function reducer(state = {
  algorithms: {
    running: false,
    error: null
  },
  jobs: {
    running: false,
    error: null
  }
}, action) {
  switch (action.type) {
  case ALGORITHMS_WORKER_ERROR:
    return {
      ...state,
      algorithms: {
        ...state.algorithms,
        error: action.err
      }
    }
  case START_ALGORITHMS_WORKER:
    return {
      ...state,
      algorithms: {
        running: true,
        error: null
      }
    }
  case STOP_ALGORITHMS_WORKER:
    return {
      ...state,
      algorithms: {
        ...state.algorithms,
        running: false
      }
    }
  case JOBS_WORKER_ERROR:
    return {
      ...state,
      jobs: {
        ...state.jobs,
        error: action.err
      }
    }
  case START_JOBS_WORKER:
    return {
      ...state,
      jobs: {
        running: true,
        error: null
      }
    }
  case STOP_JOBS_WORKER:
    return {
      ...state,
      jobs: {
        ...state.jobs,
        running: false
      }
    }
  default:
    return state
  }
}

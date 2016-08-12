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
  FETCH_PRODUCT_LINES,
  FETCH_PRODUCT_LINES_SUCCESS,
  FETCH_PRODUCT_LINES_ERROR,
  LOOKUP_PRODUCT_LINE_JOB,
  LOOKUP_PRODUCT_LINE_JOB_SUCCESS,
  LOOKUP_PRODUCT_LINE_JOB_ERROR,
} from '../../actions/productLines'

export function reducer(state = {
  error: null,
  fetching: false,
  records: [],
  jobs: {},
}, action) {
  switch (action.type) {
  case FETCH_PRODUCT_LINES:
    return Object.assign({}, state, {
      fetching: true,
    })
  case FETCH_PRODUCT_LINES_SUCCESS:
    return Object.assign({}, state, {
      fetching: false,
      records: action.records,
    })
  case FETCH_PRODUCT_LINES_ERROR:
    return Object.assign({}, state, {
      fetching: false,
      error:    action.err,
    })
  case LOOKUP_PRODUCT_LINE_JOB:
    return Object.assign({}, state, {
      jobs: Object.assign({}, state.jobs, {
        [action.productLineId]: Object.assign({}, state.jobs[action.productLineId], {
          [action.jobId]: null,  // HACK -- Sloppy way to track "is loading" status
        }),
      }),
    })
  case LOOKUP_PRODUCT_LINE_JOB_SUCCESS:
    return Object.assign({}, state, {
      jobs: Object.assign({}, state.jobs, {
        [action.productLineId]: Object.assign({}, state.jobs[action.productLineId], {
          [action.job.id]: action.job,
        }),
      }),
    })
  case LOOKUP_PRODUCT_LINE_JOB_ERROR:
    return Object.assign({}, state, {
      error: action.err,
    })
  default:
    return state
  }
}

export function deserialize() {
  // TODO -- maybe do this in the future
}

export function serialize(/*state*/) {
  // TODO -- maybe do this in the future
}

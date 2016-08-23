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
} from '../../actions/productLines'

export function reducer(state = {
  error:    null,
  fetching: false,
  records:  [],
}, action) {
  switch (action.type) {
  case FETCH_PRODUCT_LINES:
    return Object.assign({}, state, {
      error: null,
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
      error: {
        code:    action.err.code,
        message: action.err.message,
        stack:   action.err.stack,
      },
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

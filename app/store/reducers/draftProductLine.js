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
  CHANGE_PRODUCT_LINE_NAME,
  CREATE_PRODUCT_LINE,
  CREATE_PRODUCT_LINE_SUCCESS,
  CREATE_PRODUCT_LINE_ERROR,
  SELECT_PRODUCT_LINE_ALGORITHM,
} from '../../actions/draftProductLine'

const INITIAL_STATE = {
  algorithm: null,
  creating: false,
  name: '',
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case CHANGE_PRODUCT_LINE_NAME:
    return Object.assign({}, state, {
      name: action.name,
    })
  case SELECT_PRODUCT_LINE_ALGORITHM:
    return Object.assign({}, state, {
      algorithm: action.algorithm,
    })
  case CREATE_PRODUCT_LINE:
    return Object.assign({}, state, {
      creating: true,
    })
  case CREATE_PRODUCT_LINE_SUCCESS:
    return Object.assign({}, state, {
      creating: false,
      name: '',
      algorithm: null,
    })
  case CREATE_PRODUCT_LINE_ERROR:
    return Object.assign({}, state, {
      creating: false,
      error: action.err,
    })
  default:
    return state
  }
}

export function deserialize() {
  return Object.assign({}, INITIAL_STATE, {
    name: sessionStorage.getItem('draftProductLine_name') || INITIAL_STATE.name,
  })
}

export function serialize(state) {
  sessionStorage.setItem('draftProductLine_name', state.name || '')
}

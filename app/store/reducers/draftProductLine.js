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
  CHANGE_PRODUCT_LINE_NAME
} from '../../actions/draftProductLine'
import {
  CLEAR_IMAGERY,
} from '../../actions/imagery'

const INITIAL_STATE = {
  name: ''
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case CHANGE_PRODUCT_LINE_NAME:
    return {
      ...state,
      name: action.name
    }
  case CLEAR_IMAGERY:
    return {
      ...state,
      image: null
    }
  default:
    return state
  }
}

export function deserialize() {
  return {
    ...INITIAL_STATE,
    ...JSON.parse(sessionStorage.getItem('draftProductLine'))
  }
}

export function serialize(state) {
  sessionStorage.setItem('draftProductLine', JSON.stringify({
    name: state.name
  }))
}

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
  CHANGE_JOB_NAME,
  CLEAR_SELECTED_IMAGE,
  SELECT_IMAGE,
} from '../../actions/draftJob'
import {
  CLEAR_IMAGERY,
} from '../../actions/imagery'

const INITIAL_STATE = {
  name: '',
  image: null,
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case CHANGE_JOB_NAME:
    return Object.assign({}, state, {
      name: action.name,
    })
  case CLEAR_SELECTED_IMAGE:
  case CLEAR_IMAGERY:
    return Object.assign({}, state, {
      image: null,
    })
  case SELECT_IMAGE:
    return Object.assign({}, state, {
      image: action.feature,
    })
  default:
    return state
  }
}

export function deserialize() {
  return Object.assign({}, INITIAL_STATE, {
    name: sessionStorage.getItem('draftJob_name') || INITIAL_STATE.name,
  })
}

export function serialize(state) {
  sessionStorage.setItem('draftJob_name', state.name)
}

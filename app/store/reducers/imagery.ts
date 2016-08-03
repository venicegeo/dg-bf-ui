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

import {CLEAR_IMAGERY} from '../../actions/imagery'
import {SEARCH_CATALOG_SUCCESS} from '../../actions/search'

export function reducer(state = null, action) {
  switch (action.type) {
  case CLEAR_IMAGERY:
    return null
  case SEARCH_CATALOG_SUCCESS:
    return action.results
  default:
    return state
  }
}

export function deserialize() {
  return JSON.parse(sessionStorage.getItem('imagery'))
}

export function serialize(state) {
  sessionStorage.setItem('imagery', JSON.stringify(state))
}

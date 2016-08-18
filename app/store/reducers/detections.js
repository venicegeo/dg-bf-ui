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
  REMOVE_JOB,
} from '../../actions/jobs'
import {
  LOAD_DETECTIONS,
  UNLOAD_DETECTIONS
} from '../../actions/detections'

export function reducer(state = [], action) {
  switch (action.type) {
  case LOAD_DETECTIONS:
    return action.detections
  case REMOVE_JOB:
    return state.filter(r => r.id !== action.id)
  case UNLOAD_DETECTIONS:
    return []
  default:
    return state
  }
}

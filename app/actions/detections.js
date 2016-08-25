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
  KEY_GEOJSON_DATA_ID
} from '../constants'

//
// Action Types
//

export const LOAD_DETECTIONS = 'LOAD_DETECTIONS'
export const UNLOAD_DETECTIONS = 'UNLOAD_DETECTIONS'

//
// Action Creators
//

const loadDetections = (detections) => ({
  type: LOAD_DETECTIONS,
  detections,
})

const unloadDetections = () => ({
  type: UNLOAD_DETECTIONS,
})

export function changeLoadedDetections(jobIds = []) {
  return (dispatch, getState) => {
    const state = getState()
    const alreadyLoadedIds = simplify(state.detections.map(d => d.id))
    const incomingIds = simplify(jobIds)

    if (alreadyLoadedIds === incomingIds) {
      return  // Nothing to do
    }

    // Removals
    if (alreadyLoadedIds && !incomingIds) {
      dispatch(unloadDetections())
      return
    }

    // Additions/Updates
    const loadableJobs = state.jobs.records.filter(j => jobIds.includes(j.id) && j.properties[KEY_GEOJSON_DATA_ID])
    const loadableIds = simplify(loadableJobs.map(j => j.id))
    if (alreadyLoadedIds === loadableIds) {
      return  // Avoid thrashing the reducer with spurious updates
    }
    dispatch(loadDetections(loadableJobs))
  }
}

//
// Helpers
//

function simplify(items) {
  return items.slice().sort().join(',')
}

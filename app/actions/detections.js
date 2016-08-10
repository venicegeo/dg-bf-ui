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

import {featureToBbox} from '../utils/bbox'
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

export function loadDetections(idsToLoad = []) {
  return (dispatch, getState) => {
    const completedJobs = getState().jobs.records.filter(j => j.properties[KEY_GEOJSON_DATA_ID])
    dispatch({
      type:       LOAD_DETECTIONS,
      detections: completedJobs.filter(j => idsToLoad.includes(j.id)).map(toDetection),
    })
  }
}

export function unloadDetections() {
  return {
    type: UNLOAD_DETECTIONS,
  }
}

//
// Helpers
//

function toDetection(job) {
  return {
    bbox:    featureToBbox(job),
    jobId:   job.id,
    layerId: job.properties[KEY_GEOJSON_DATA_ID],
  }
}

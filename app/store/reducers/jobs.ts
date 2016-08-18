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

import {upgradeIfNeeded} from '../../utils/upgrade-job-record'

import {
  CREATE_JOB,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  DISMISS_JOB_ERROR,
  FETCH_JOBS,
  FETCH_JOBS_SUCCESS,
  IMPORT_JOB_SUCCESS,
  JOBS_WORKER_ERROR,
  REMOVE_JOB,
  UPDATE_JOB,
} from '../../actions/jobs'

import {
  KEY_GEOJSON_DATA_ID,
  KEY_RASTER_DATA_ID,
  KEY_STATUS,
  KEY_WMS_LAYER_ID,
  KEY_WMS_URL,
} from '../../constants'

const INITIAL_STATE = {
  creating:    false,
  fetching:    false,
  records:     [],
  error:       null,
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case FETCH_JOBS:
    return Object.assign({}, state, {
      fetching: true,
    })
  case FETCH_JOBS_SUCCESS:
    return Object.assign({}, state, {
      fetching: false,
      records: action.records,
    })
  case REMOVE_JOB:
    return Object.assign({}, state, {
      records: state.records.filter(j => j.id !== action.id),
    })
  case CREATE_JOB:
    return Object.assign({}, state, {
      creating: true,
    })
  case CREATE_JOB_SUCCESS:
    return Object.assign({}, state, {
      creating: false,
      records: [...state.records, action.record],
    })
  case IMPORT_JOB_SUCCESS:
    return Object.assign({}, state, {
      records: [...state.records, action.record],
    })
  case CREATE_JOB_ERROR:
    return Object.assign({}, state, {
      creating: false,
      error: action.err,
    })
  case JOBS_WORKER_ERROR:
    return Object.assign({}, state, {
      error: action.err,
    })
  case DISMISS_JOB_ERROR:
    return Object.assign({}, state, {
      error: null,
    })
  case UPDATE_JOB:
    return Object.assign({}, state, {
      records: state.records.map(job => {
        if (job.id !== action.jobId) {
          return job
        }
        return Object.assign({}, job, {
          properties: Object.assign({}, job.properties, {
            [KEY_STATUS]:          action.status,
            [KEY_GEOJSON_DATA_ID]: action.geojsonDataId,
            [KEY_RASTER_DATA_ID]:  action.imageryDataId,
            [KEY_WMS_LAYER_ID]:    action.wmsLayerId,
            [KEY_WMS_URL]:         action.wmsUrl,
          }),
        })
      }),
    })
  default:
    return state
  }
}

export function deserialize() {
  return Object.assign({}, INITIAL_STATE, {
    records: (JSON.parse(localStorage.getItem('jobs_records')) || INITIAL_STATE.records).map(upgradeIfNeeded).filter(Boolean),
  })
}

export function serialize(state) {
  localStorage.setItem('jobs_records', JSON.stringify(state.records))
}

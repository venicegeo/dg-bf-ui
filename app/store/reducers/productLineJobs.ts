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
  FETCH_PRODUCT_LINES_SUCCESS,
} from '../../actions/productLines'

import {
  FETCH_PRODUCT_LINE_JOBS,
  FETCH_PRODUCT_LINE_JOBS_SUCCESS,
  FETCH_PRODUCT_LINE_JOBS_ERROR,
  IMPORT_PRODUCT_LINE_JOB,
  IMPORT_PRODUCT_LINE_JOB_SUCCESS,
  IMPORT_PRODUCT_LINE_JOB_ERROR,
  SELECT_PRODUCT_LINE_JOB,
  CLEAR_SELECTED_PRODUCT_LINE_JOB,
  HOVER_PRODUCT_LINE_JOB,
  CLEAR_HOVERED_PRODUCT_LINE_JOB,
} from '../../actions/productLineJobs'

const INITIAL_STATE = {
  byPLID: {},
  hovered: null,
  selection: [],
}

export function reducer(state: TypeState = INITIAL_STATE, action): TypeState {
  switch (action.type) {

  // Provision new collections for all incoming product lines
  case FETCH_PRODUCT_LINES_SUCCESS:
    const collections = {}
    for (const productLine of action.records) {
      collections[productLine.id] = collection(undefined, action)
    }
    return Object.assign({}, state, {
      byPLID: collections,
    })

  // Delegate collection item mutations
  case FETCH_PRODUCT_LINE_JOBS:
  case FETCH_PRODUCT_LINE_JOBS_SUCCESS:
  case FETCH_PRODUCT_LINE_JOBS_ERROR:
  case IMPORT_PRODUCT_LINE_JOB:
  case IMPORT_PRODUCT_LINE_JOB_SUCCESS:
  case IMPORT_PRODUCT_LINE_JOB_ERROR:
    return Object.assign({}, state, {
      byPLID: Object.assign({}, state.byPLID, {
        [action.productLineId]: collection(state.byPLID[action.productLineId], action),
      }),
    })

  // Selected Jobs
  case SELECT_PRODUCT_LINE_JOB:
    return Object.assign({}, state, {
      selection: [action.job],
    })
  case CLEAR_SELECTED_PRODUCT_LINE_JOB:
    return Object.assign({}, state, {
      selection: [],
    })

  // Hovered
  case HOVER_PRODUCT_LINE_JOB:
    return Object.assign({}, state, {
      hovered: action.job,
    })
  case CLEAR_HOVERED_PRODUCT_LINE_JOB:
    return Object.assign({}, state, {
      hovered: null,
    })

  default:
    return state
  }
}

function collection(state: TypeCollection = {
  error:     null,
  fetching:  false,
  records:   [],
  sinceDate: null,
}, action): TypeCollection {
  switch (action.type) {
  case FETCH_PRODUCT_LINE_JOBS:
    return Object.assign({}, state, {
      fetching:  true,
      sinceDate: action.sinceDate,
    })

  case FETCH_PRODUCT_LINE_JOBS_SUCCESS:
    return Object.assign({}, state, {
      fetching: false,
      records:  action.jobIds.map(id => ({id})),
    })

  case FETCH_PRODUCT_LINE_JOBS_ERROR:
    return Object.assign({}, state, {
      fetching: false,
      error: {
        message: action.err.message,
        stack:   action.err.stack,
      },
    })

  // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
  // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
  // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
  /*
    Until bf-handle can figure out a way to solve the fan-out problem
    server-side, this is the world we have to live in...
   */
  case IMPORT_PRODUCT_LINE_JOB:
    return Object.assign({}, state, {
      records: state.records.map(record => {
        if (record.id === action.jobId) {
          return {
            id:      action.jobId,
            loading: true,
          }
        }
        return record
      }),
    })

  case IMPORT_PRODUCT_LINE_JOB_SUCCESS:
    return Object.assign({}, state, {
      records: state.records.map(record => {
        if (record.id === action.job.id) {
          // Replace the placeholder with the actual job object
          return action.job
        }
        return record
      }),
    })

  case IMPORT_PRODUCT_LINE_JOB_ERROR:
    return Object.assign({}, state, {
      error: {
        message: action.err.message,
        stack: action.err.stack,
      },

      // Discard the unloadable job
      records: state.records.filter(r => r.id !== action.jobId),
    })
  // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
  // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
  // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

  default:
    return state
  }
}

export interface TypeCollection {
  error: any
  fetching: boolean
  records: beachfront.Job[]
  sinceDate: string
}

export interface TypeState {
  byPLID: {
    [productLineId: string]: TypeCollection
  }
  hovered: beachfront.Job
  selection: beachfront.Job[]
}

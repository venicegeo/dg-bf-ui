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
  CREATE_JOB,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  DISCOVER_EXECUTOR,
  DISCOVER_EXECUTOR_ERROR,
  DISCOVER_EXECUTOR_SUCCESS,
  FETCH_JOBS,
  FETCH_JOBS_SUCCESS,
  UPDATE_JOB,
} from '../../actions/jobs'

const INITIAL_STATE = {
  serviceId:   null,
  creating:    false,
  discovering: false,
  fetching:    false,
  records:     [],
  error:       null
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case DISCOVER_EXECUTOR:
    return {
      ...state,
      discovering: true
    }
  case DISCOVER_EXECUTOR_SUCCESS:
    return {
      ...state,
      discovering: false,
      serviceId: action.serviceId
    }
  case DISCOVER_EXECUTOR_ERROR:
    return {
      ...state,
      discovering: false,
      error: action.err
    }
  case FETCH_JOBS:
    return {
      ...state,
      fetching: true
    }
  case FETCH_JOBS_SUCCESS:
    return {
      ...state,
      fetching: false,
      records: action.records
    }
  case CREATE_JOB:
    return {
      ...state,
      creating: true
    }
  case CREATE_JOB_SUCCESS:
    return {
      ...state,
      creating: false,
      records: [...state.records, action.record]
    }
  case CREATE_JOB_ERROR:
    return {
      ...state,
      creating: false,
      error: action.err
    }
  case UPDATE_JOB:
    return {
      ...state,
      records: state.records.map(job => {
        if (job.id !== action.jobId) {
          return job
        }
        return {
          ...job,
          status: action.status,
          resultId: action.resultId
        }
      })
    }
  default:
    return state
  }
}

export function deserialize() {
  return {
    ...INITIAL_STATE,
    records: JSON.parse(localStorage.getItem('jobs.records')),
  }
}

export function serialize(state) {
  localStorage.setItem('jobs.records', JSON.stringify(state.records))
}

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

import {Client} from '../utils/piazza-client'
import * as worker from './workers/jobs'
import {fromFeature} from '../utils/bbox'
import {GATEWAY, JOBS_WORKER} from '../config'

import {
  KEY_IMAGE_ID,
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_NAME,
  KEY_RESULT_ID,
  KEY_STATUS,
  KEY_TYPE,
  KEY_VERSION,
  KEY_THUMBNAIL,
  REQUIREMENT_BANDS,
  STATUS_RUNNING,
  TYPE_JOB,
} from '../constants'

//
// Action Types
//

export const CREATE_JOB = 'CREATE_JOB'
export const CREATE_JOB_SUCCESS = 'CREATE_JOB_SUCCESS'
export const CREATE_JOB_ERROR = 'CREATE_JOB_ERROR'
export const DISCOVER_EXECUTOR = 'DISCOVER_EXECUTOR'
export const DISCOVER_EXECUTOR_SUCCESS = 'DISCOVER_EXECUTOR_SUCCESS'
export const DISCOVER_EXECUTOR_ERROR = 'DISCOVER_EXECUTOR_ERROR'
export const DISMISS_JOB_ERROR = 'DISMISS_JOB_ERROR'
export const FETCH_JOBS = 'FETCH_JOBS'
export const FETCH_JOBS_SUCCESS = 'FETCH_JOBS_SUCCESS'
export const JOBS_WORKER_ERROR = 'JOBS_WORKER_ERROR'
export const START_JOBS_WORKER = 'START_JOBS_WORKER'
export const STOP_JOBS_WORKER = 'STOP_JOBS_WORKER'
export const UPDATE_JOB = 'UPDATE_JOB'

//
// Action Creators
//

export function createJob(catalogApiKey, name, algorithm, feature) {
  return (dispatch, getState) => {
    const state = getState()
    const client = new Client(GATEWAY, state.authentication.token)
    dispatch({
      type: CREATE_JOB
    })

    return client.post('execute-service', {
      dataInputs: {
        body: {
          content: JSON.stringify({
            algoType: algorithm.type,
            svcURL: algorithm.url,
            pzAuthToken: client.authToken,
            pzAddr: client.gateway,
            dbAuthToken: catalogApiKey,
            bands: algorithm.requirements.find(a => a.name === REQUIREMENT_BANDS).literal.split(','),
            metaDataJSON: feature
          }),
          type: 'body',
          mimeType: 'application/json'
        }
      },
      dataOutput: [
        {
          mimeType: 'application/json',
          type: 'text'
        }
      ],
      serviceId: state.jobs.serviceId
    })
      .then(id => {
        dispatch(createJobSuccess(id, name, algorithm, feature))
        return id
      })
      .catch(err => {
        dispatch(createJobError(err))
      })
  }
}

export function discoverExecutorIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.jobs.serviceId || state.jobs.discovering || state.jobs.error) {
      return
    }
    dispatch(discoverExecutor())
  }
}

export function dismissJobError() {
  return {
    type: DISMISS_JOB_ERROR
  }
}

export function startJobsWorkerIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.workers.jobs.running || state.workers.jobs.error) {
      return
    }
    dispatch(startJobsWorker())
  }
}

//
// Internals
//

function createJobError(err) {
  return {
    type: CREATE_JOB_ERROR,
    err
  }
}

function createJobSuccess(id, name, algorithm, feature) {
  return {
    type: CREATE_JOB_SUCCESS,
    record: {
      id,
      geometry: feature.geometry,
      properties: {
        [KEY_ALGORITHM_NAME]: algorithm.name,
        [KEY_CREATED_ON]:     new Date().toISOString(),
        [KEY_IMAGE_ID]:       feature.id,
        [KEY_NAME]:           name,
        [KEY_STATUS]:         STATUS_RUNNING,
        [KEY_THUMBNAIL]:      feature.properties[KEY_THUMBNAIL],
        [KEY_TYPE]:           TYPE_JOB,
      },
      type: 'Feature',
    }
  }
}

function discoverExecutor() {
  return (dispatch, getState) => {
    dispatch({
      type: DISCOVER_EXECUTOR
    })

    const client = new Client(GATEWAY, getState().authentication.token)
    client.getServices({pattern: '^bf-handle'})
      .then(([executor]) => {
        if (executor) {
          dispatch(discoverExecutorSuccess(executor.serviceId))
        }
        else {
          dispatch(discoverExecutorError('Could not find Beachfront API service'))
        }
      })
      .catch(err => {
        dispatch(discoverExecutorError(err))
      })
  }
}

function discoverExecutorError(err) {
  return {
    type: DISCOVER_EXECUTOR_ERROR,
    err
  }
}

function discoverExecutorSuccess(serviceId) {
  return {
    type: DISCOVER_EXECUTOR_SUCCESS,
    serviceId
  }
}

function jobsWorkerError(err) {
  return {
    type: JOBS_WORKER_ERROR,
    err
  }
}

function startJobsWorker() {
  return (dispatch, getState) => {
    dispatch({
      type: START_JOBS_WORKER
    })

    const client = new Client(GATEWAY, getState().authentication.token)
    worker.start(client, JOBS_WORKER.INTERVAL, JOBS_WORKER.JOB_TTL, {
      getRecords() {
        return getState().jobs.records
      },
      onFailure(err) {
        dispatch(jobsWorkerError(err))
      },
      onTerminate() {
        dispatch(stopJobsWorker())
      },
      onUpdate(jobId, status, resultId) {
        dispatch(updateJob(jobId, status, resultId))
      }
    })
  }
}

function stopJobsWorker() {
  return {
    type: STOP_JOBS_WORKER
  }
}

function updateJob(jobId, status, resultId) {
  return {
    type: UPDATE_JOB,
    jobId,
    status,
    resultId
  }
}

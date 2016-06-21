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
  REQUIREMENT_BANDS,
  STATUS_RUNNING
} from '../constants'

//
// Action Types
//

export const CREATE_JOB = 'CREATE_JOB'
export const CREATE_JOB_SUCCESS = 'CREATE_JOB_SUCCESS'
export const CREATE_JOB_ERROR = 'CREATE_JOB_ERROR'
export const DISCOVER_SERVICE = 'DISCOVER_SERVICE'
export const DISCOVER_SERVICE_SUCCESS = 'DISCOVER_SERVICE_SUCCESS'
export const DISCOVER_SERVICE_ERROR = 'DISCOVER_SERVICE_ERROR'
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
        const bbox = fromFeature(feature)
        dispatch(createJobSuccess(id, name, algorithm, bbox, feature.id))
        return id
      })
      .catch(err => {
        dispatch(createJobError(err))
      })
  }
}

export function discoverServiceIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.jobs.serviceId || state.jobs.discovering || state.jobs.error) {
      return
    }
    dispatch(discoverService())
    const client = new Client(GATEWAY, state.authentication.token)

    return client.getServices({pattern: '^bf-handle'})
      .then(([beachfrontApi]) => {
        if (beachfrontApi) {
          dispatch(discoverServiceSuccess(beachfrontApi.serviceId))
        }
        else {
          dispatch(discoverServiceError('Could not find Beachfront API service'))
        }
      })
      .catch(err => {
        dispatch(discoverServiceError(err))
      })
  }
}

export function startJobsWorkerIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.workers.jobs.running || state.workers.jobs.error) {
      return
    }
    const client = new Client(GATEWAY, state.authentication.token)
    worker.start(client, JOBS_WORKER.INTERVAL, JOBS_WORKER.JOB_TTL, {
      select() {
        return getState().jobs
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

function createJobSuccess(id, name, algorithm, bbox, imageId) {
  return {
    type: CREATE_JOB_SUCCESS,
    record: {
      bbox,
      id,
      imageId,
      name,
      algorithmName: algorithm.name,
      createdOn: Date.now(),
      status: STATUS_RUNNING
    }
  }
}

function discoverService() {
  return {
    type: DISCOVER_SERVICE
  }
}

function discoverServiceError(err) {
  return {
    type: DISCOVER_SERVICE_ERROR,
    err
  }
}

function discoverServiceSuccess(serviceId) {
  return {
    type: DISCOVER_SERVICE_SUCCESS,
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
  return {
    type: START_JOBS_WORKER
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

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

import * as moment from 'moment'
import {Client} from '../utils/piazza-client'
import {importRecordById} from '../utils/import-job-record'
import * as worker from './workers/jobs'
import {
  GATEWAY,
  JOBS_WORKER,
  SCHEMA_VERSION,
} from '../config'

import {
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
export const DISMISS_JOB_ERROR = 'DISMISS_JOB_ERROR'
export const FETCH_JOBS = 'FETCH_JOBS'
export const FETCH_JOBS_SUCCESS = 'FETCH_JOBS_SUCCESS'
export const IMPORT_JOB = 'IMPORT_JOB'
export const IMPORT_JOB_SUCCESS = 'IMPORT_JOB_SUCCESS'
export const IMPORT_JOB_ERROR = 'IMPORT_JOB_ERROR'
export const REMOVE_JOB = 'REMOVE_JOB'
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
      type: CREATE_JOB,
    })

    return client.post('execute-service', {
      dataInputs: {
        body: {
          content: JSON.stringify({
            algoType:      algorithm.type,
            svcURL:        algorithm.url,
            pzAuthToken:   client.authToken,
            pzAddr:        client.gateway,
            dbAuthToken:   catalogApiKey,
            bands:         algorithm.requirements.find(a => a.name === REQUIREMENT_BANDS).literal.split(','),
            metaDataJSON:  feature,
            resultName:    name,
          }),
          type:     'body',
          mimeType: 'application/json',
        },
      },
      dataOutput: [
        {
          mimeType: 'application/json',
          type:     'text',
        },
      ],
      serviceId: state.executor.serviceId,
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

export function dismissJobError() {
  return {
    type: DISMISS_JOB_ERROR,
  }
}

const importJobSuccess = (record) => ({
  type: IMPORT_JOB_SUCCESS,
  record,
})

const importJobError = (err) => ({
  type: IMPORT_JOB_ERROR,
  err,
})

export function importJob(id) {
  return (dispatch, getState) => {
    dispatch({
      type: IMPORT_JOB,
      id,
    })
    const state = getState()
    const client = new Client(GATEWAY, state.authentication.token)
    const algorithmNames = generateAlgorithmNamesHash(state.algorithms.records)
    return importRecordById(client, id, algorithmNames)
      .then(record => {
        dispatch(importJobSuccess(record))
      })
      .catch(err => {
        dispatch(importJobError(err))
        throw err
      })
  }
}

export function removeJob(id) {
  return {
    type: REMOVE_JOB,
    id,
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
    err,
  }
}

function createJobSuccess(id, name, algorithm, feature: beachfront.Scene) {
  return {
    type: CREATE_JOB_SUCCESS,
    record: {
      id,
      geometry: feature.geometry,
      properties: {
        __schemaVersion__: SCHEMA_VERSION,
        algorithmName:     algorithm.name,
        createdOn:         new Date().toISOString(),
        imageCaptureDate:  moment(feature.properties.acquiredDate).toISOString(),
        imageId:           feature.id,
        imageSensorName:   feature.properties.sensorName,
        name:              name,
        status:            STATUS_RUNNING,
        type:              TYPE_JOB,
      },
      type: 'Feature',
    } as beachfront.Job,
  }
}

function jobsWorkerError(err) {
  return {
    type: JOBS_WORKER_ERROR,
    err,
  }
}

function startJobsWorker() {
  return (dispatch, getState) => {
    dispatch({
      type: START_JOBS_WORKER,
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
      onUpdate(jobId, status, geojsonDataId, imageryDataId, wmsLayerId, wmsUrl) {
        dispatch(updateJob(jobId, status, geojsonDataId, imageryDataId, wmsLayerId, wmsUrl))
      },
    })
  }
}

function stopJobsWorker() {
  return {
    type: STOP_JOBS_WORKER,
  }
}

function updateJob(
  jobId,
  status,
  geojsonDataId = null,
  imageryDataId = null,
  wmsLayerId = null,
  wmsUrl = null
) {
  return {
    type: UPDATE_JOB,
    jobId,
    status,
    geojsonDataId,
    imageryDataId,
    wmsLayerId,
    wmsUrl,
  }
}

//
// Helpers
//

function generateAlgorithmNamesHash(algorithms) {
  const hash = {}
  for (const algorithm of algorithms) {
    hash[algorithm.url] = algorithm.name
  }
  return hash
}
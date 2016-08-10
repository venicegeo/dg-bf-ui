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

import moment from 'moment'
import {Client} from '../utils/piazza-client'
import * as worker from './workers/jobs'
import {GATEWAY, JOBS_WORKER, SCHEMA_VERSION} from '../config'

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_GEOJSON_DATA_ID,
  KEY_IMAGE_ID,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_SENSOR,
  KEY_NAME,
  KEY_STATUS,
  KEY_TYPE,
  KEY_SCHEMA_VERSION,
  KEY_THUMBNAIL,
  REQUIREMENT_BANDS,
  STATUS_RUNNING,
  STATUS_SUCCESS,
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
      type: CREATE_JOB
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
            name:          name,
          }),
          type:     'body',
          mimeType: 'application/json'
        }
      },
      dataOutput: [
        {
          mimeType: 'application/json',
          type:     'text'
        }
      ],
      serviceId: state.executor.serviceId
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
    type: DISMISS_JOB_ERROR
  }
}

const importJobSuccess = (
  id,
  algorithmName,
  dateCreated,
  geometry,
  geojsonDataId,
  imageCaptureDate,
  imageId,
  name,
  sensorName
) => ({
  type: IMPORT_JOB_SUCCESS,
  record: {
    id,
    geometry,
    properties: {
      [KEY_ALGORITHM_NAME]:    algorithmName,
      [KEY_CREATED_ON]:        dateCreated,
      [KEY_IMAGE_CAPTURED_ON]: imageCaptureDate,
      [KEY_GEOJSON_DATA_ID]:   geojsonDataId,
      [KEY_IMAGE_ID]:          imageId,
      [KEY_IMAGE_SENSOR]:      sensorName,
      [KEY_NAME]:              name,
      [KEY_STATUS]:            STATUS_SUCCESS,
      [KEY_TYPE]:              TYPE_JOB,
      [KEY_SCHEMA_VERSION]:    SCHEMA_VERSION,
    },
    type: 'Feature',
  },
})

const importJobError = (err) => ({
  type: IMPORT_JOB_ERROR,
  err,
})

export function importJob(jobId) {
  return (dispatch, getState) => {
    dispatch({
      type: IMPORT_JOB,
    })
    const client = new Client(GATEWAY, getState().authentication.token)
    return client.getStatus(jobId)
      .then(status => {
        if (status.status !== STATUS_SUCCESS) {
          throw importError(`invalid status (job=${jobId}, status=${status.status})`)
        }
        return client.getFile(status.result.dataId)
      })
      .then(executionOutput => JSON.parse(executionOutput))
      .then(metadata => {

        // Required fields
        const geometry = metadata.geometry
        if (!geometry || !geometry.type || !Array.isArray(geometry.coordinates)) {
          throw importError(`invalid geometry (job=${jobId})`)
        }

        const imageCaptureDate = metadata.imageCaptureDate
        if (!imageCaptureDate) {
          throw importError(`invalid image capture date '${imageCaptureDate}' (job=${jobId})`)
        }

        const imageId = metadata.imageId
        if (!imageId) {
          throw importError(`invalid image ID '${imageId}' (job=${jobId})`)
        }

        const sensorName = metadata.sensorName
        if (!sensorName) {
          throw importError(`invalid sensor name '${sensorName}' (job=${jobId})`)
        }

        const geojsonDataId = metadata.shoreDataID
        if (!geojsonDataId) {
          throw importError(`invalid geojson data ID '${geojsonDataId}' (job=${jobId})`)
        }

        // Optional fields
        const algorithm = getState().algorithms.records.find(a => a.url === metadata.algorithmUrl)
        const algorithmName = algorithm ? algorithm.name : 'Unknown Algorithm'
        const name = metadata.name || 'IMPORTED_' + jobId.substr()
        const dateCreated = metadata.dateCreated || new Date().toISOString()

        dispatch(
          importJobSuccess(
            jobId,
            algorithmName,
            dateCreated,
            geometry,
            geojsonDataId,
            imageCaptureDate,
            imageId,
            name,
            sensorName
          )
        )
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
    id
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
        [KEY_ALGORITHM_NAME]:    algorithm.name,
        [KEY_CREATED_ON]:        new Date().toISOString(),
        [KEY_IMAGE_CAPTURED_ON]: moment(feature.properties[KEY_IMAGE_CAPTURED_ON]).toISOString(),
        [KEY_IMAGE_ID]:          feature.id,
        [KEY_IMAGE_SENSOR]:      feature.properties[KEY_IMAGE_SENSOR],
        [KEY_NAME]:              name,
        [KEY_STATUS]:            STATUS_RUNNING,
        [KEY_THUMBNAIL]:         feature.properties[KEY_THUMBNAIL],
        [KEY_TYPE]:              TYPE_JOB,
        [KEY_SCHEMA_VERSION]:    SCHEMA_VERSION,
      },
      type: 'Feature',
    }
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
      onUpdate(...args) {
        dispatch(updateJob(...args))
      }
    })
  }
}

function stopJobsWorker() {
  return {
    type: STOP_JOBS_WORKER
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

function importError(message, extras) {
  const err = new Error(message)
  Object.assign(err, extras, {message})
  err.message = message
  return err
}
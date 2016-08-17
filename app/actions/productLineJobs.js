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
import {importRecordById as importJobRecordById} from '../utils/import-job-record'
import {Client} from '../utils/piazza-client'
import {GATEWAY} from '../config'

import {
  KEY_CREATED_ON,
} from '../constants'

export const FETCH_PRODUCT_LINE_JOBS = 'Fetch Product Line Jobs'
export const FETCH_PRODUCT_LINE_JOBS_SUCCESS = 'Fetch Product Line Jobs (Success)'
export const FETCH_PRODUCT_LINE_JOBS_ERROR = 'Fetch Product Line Jobs (Error)'
export const IMPORT_PRODUCT_LINE_JOB = 'IMPORT_PRODUCT_LINE_JOB'
export const IMPORT_PRODUCT_LINE_JOB_SUCCESS = 'IMPORT_PRODUCT_LINE_JOB_SUCCESS'
export const IMPORT_PRODUCT_LINE_JOB_ERROR = 'IMPORT_PRODUCT_LINE_JOB_ERROR'

const fetchProductLineJobsSuccess = (productLineId, jobIds) => ({
  type: FETCH_PRODUCT_LINE_JOBS_SUCCESS,
  productLineId,
  jobIds,
})

const fetchProductLineJobsError = (productLineId, err) => ({
  type: FETCH_PRODUCT_LINE_JOBS_ERROR,
  productLineId,
  err: {
    message: err.message,
    stack:   err.stack,
  },
})

export function fetchProductLineJobs(productLineId, sinceDate) {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({
      type: FETCH_PRODUCT_LINE_JOBS,
      productLineId,
      sinceDate,
    })
    return fetch(`${state.executor.url}/listProdLineJobs`, {
      body: JSON.stringify({

        // FIXME -- I can has property name consistency, bfhandle?
        TriggerId:   productLineId,
        PzAuthToken: state.authentication.token,
        PzAddr:      GATEWAY,
        PerPage:     '200',  // HACK -- see explanation below
      }),
      headers: {'content-type': 'application/json'},
      method: 'POST'
    })
      .then(checkResponse)
      .then(jobIds => {
        dispatch(fetchProductLineJobsSuccess(productLineId, jobIds))
        dispatch(__keepFetchingJobRecordsUntilSinceDate__(productLineId, sinceDate))
      })
      .catch(err => {
        dispatch(fetchProductLineJobsError(productLineId, err))
      })
  }
}

// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
/*
  Until bf-handle can figure out a way to solve the fan-out problem
  server-side, this is the world we have to live in...

  The overall strategy here is:
    (1) grab as many job IDs are we're comfortable hammering Piazza for
    (2) select first 10 job IDs that have not yet been loaded
    (3) fetch those jobs
    (4) if oldest job's creation date >= sinceDate & more to load, go to #2

  Assumptions:
    - 200 jobs should be enough to satisfy the user's curiosity
    - Piazza doesn't mind being hammered with 200(*4) HTTP requests over the
      course of ~5 minutes
 */
function __keepFetchingJobRecordsUntilSinceDate__(productLineId, sinceDate) {
  return (dispatch, getState) => {
    const getRecords = () => getState().productLineJobs[productLineId].records

    const firstTenIds = getRecords().filter(r => !r.properties).map(r => r.id).slice(0, 10)
    if (!firstTenIds.length) {
      return  // Nothing to do
    }
    dispatch({
      type: 'HACK >>> fetch 10 jobs',
      sinceDate,
      firstTenIds,
    })

    return Promise.all(firstTenIds.map(jobId => dispatch(importProductLineJob(productLineId, jobId))))
      .then(() => {
        const localsInDateOrder = getRecords()
        const oldestLoadedRecord = localsInDateOrder.filter(r => r.properties).pop()
        const haventReachedSinceDate = moment(sinceDate).isBefore(moment(oldestLoadedRecord.properties[KEY_CREATED_ON]))
        const isMoreToLoad = localsInDateOrder.some(j => !j.properties)
        if (isMoreToLoad && haventReachedSinceDate) {
          dispatch(__keepFetchingJobRecordsUntilSinceDate__(productLineId, sinceDate))
        }
        else {
          dispatch({
            type: 'HACK >>> no more jobs to load',
          })
        }
      })
      .catch(err => {
        dispatch({
          type: 'HACK >>> Error fetching jobs',
          err: {
            message: err.message,
            stack: err.stack,
          }
        })
        console.warn('Abandoning attempt to keep fetching jobs due to error:')
        console.error(err)
      })
  }
}
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

const importProductLineJobSuccess = (productLineId, job) => ({
  type: IMPORT_PRODUCT_LINE_JOB_SUCCESS,
  productLineId,
  job,
})

const importProductLineJobError = (productLineId, jobId, err) => ({
  type: IMPORT_PRODUCT_LINE_JOB_ERROR,
  err,
  productLineId,
  jobId,
})

function importProductLineJob(productLineId, jobId) {
  return (dispatch, getState) => {
    const state = getState()
    dispatch({
      type: IMPORT_PRODUCT_LINE_JOB,
      productLineId,
      jobId,
    })

    const algorithmNames = generateAlgorithmNamesHash(state.algorithms.records)
    const client = new Client(GATEWAY, state.authentication.token)
    return importJobRecordById(client, jobId, algorithmNames)
      .then(job => {
        dispatch(importProductLineJobSuccess(productLineId, job))
      })
      .catch(err => {
        dispatch(importProductLineJobError(productLineId, jobId, err))
        throw err
      })
  }
}

//
// Helpers
//

function checkResponse(response) {
  if (response.ok) {
    return response.json()
  }
  throw new Error(`HttpError: (code=${response.status})`)
}

function generateAlgorithmNamesHash(algorithms) {
  const hash = {}
  for (const algorithm of algorithms) {
    hash[algorithm.url] = algorithm.name
  }
  return hash
}

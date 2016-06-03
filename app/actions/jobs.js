import {Client} from '../utils/piazza-client'
import * as worker from './workers/jobs'
import {GATEWAY, JOBS_WORKER} from '../config'

import {STATUS_RUNNING} from '../constants'

//
// Action Types
//

export const CREATE_JOB = 'CREATE_JOB'
export const CREATE_JOB_SUCCESS = 'CREATE_JOB_SUCCESS'
export const CREATE_JOB_ERROR = 'CREATE_JOB_ERROR'
export const FETCH_JOBS = 'FETCH_JOBS'
export const FETCH_JOBS_SUCCESS = 'FETCH_JOBS_SUCCESS'
export const JOBS_WORKER_ERROR = 'JOBS_WORKER_ERROR'
export const START_JOBS_WORKER = 'START_JOBS_WORKER'
export const STOP_JOBS_WORKER = 'STOP_JOBS_WORKER'
export const UPDATE_JOB = 'UPDATE_JOB'

//
// Action Creators
//

export function createJob({catalogApiKey, name, algorithm, feature}) {
  return (dispatch, getState) => {
    const client = new Client(GATEWAY, getState().login.authToken)
    const body = {
      algoType: algorithm.name,
      svcURL: algorithm.url,
      pzAuthToken: client.authToken,
      pzAddr: client.gateway,
      dbAuthToken: catalogApiKey,
      bands: ['green', 'swir1'],  // FIXME
      metaDataJSON: feature
    }
    dispatch({
      type: CREATE_JOB
    })
    // return client.post('execute-service', body)
    // HACK
    return fetch('https://bf-handle.int.geointservices.io/execute', {
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HttpError (code=${response.status})`)
        }
        return response.text()
      })
    // HACK
      .then(id => {
        dispatch(createJobSuccess(id, name, algorithm))
      })
      .catch(err => {
        dispatch(createJobError(err))
      })
  }
}

export function startJobsWorkerIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.workers.jobs.running) {
      return
    }
    if (state.workers.jobs.error) {
      return
    }
    const client = new Client(GATEWAY, state.login.authToken)
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
    dispatch({type: START_JOBS_WORKER})
  }
}

//
// Internals
//

function createJobError(err) {
  return {
    type: CREATE_JOB_ERROR,
    message: err.toString()
  }
}

function createJobSuccess(id, name, algorithm) {
  return {
    type: CREATE_JOB_SUCCESS,
    record: {
      id,
      name,
      algorithmName: algorithm.name,
      createdOn: Date.now(),
      status: STATUS_RUNNING
    }
  }
}

function jobsWorkerError(err) {
  return {
    type: JOBS_WORKER_ERROR,
    message: err.toString()
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

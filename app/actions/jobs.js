import {Client} from '../utils/piazza-client'
import * as worker from './workers/jobs'
import {GATEWAY, JOBS_WORKER} from '../config'

const {STATUS_RUNNING} = worker

//
// Actions
//

export const CREATE_JOB = 'CREATE_JOB'
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
        dispatch({
          type: CREATE_JOB,
          record: {
            id,
            name,
            algorithmName: algorithm.name,
            createdOn: Date.now(),
            status: STATUS_RUNNING
          }
        })
      })
      .catch(err => {
        dispatch({
          type: CREATE_JOB_ERROR,
          message: err.toString()
        })
      })
  }
}

export function startJobsWorker() {
  return (dispatch, getState) => {
    if (getState().workers.jobs.running) {
      return
    }
    const client = new Client(GATEWAY, getState().login.authToken)
    const interval = JOBS_WORKER.INTERVAL
    const ttl = JOBS_WORKER.JOB_TTL
    worker.start(client, interval, ttl, {
      select() {
        return getState().jobs
      },
      onFailure(err) {
        dispatch({
          type: JOBS_WORKER_ERROR,
          message: err.toString()
        })
      },
      onTerminate() {
        dispatch({
          type: STOP_JOBS_WORKER
        })
      },
      onUpdate(jobId, status, resultId) {
        dispatch({
          type: UPDATE_JOB,
          jobId,
          status,
          resultId
        })
      }
    })
    dispatch({type: START_JOBS_WORKER})
  }
}

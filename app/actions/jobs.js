import {Client} from '../utils/piazza-client'
import * as worker from './workers/jobs'
import {GATEWAY, JOBS_WORKER} from '../config'

const {STATUS_RUNNING} = worker

//
// Actions
//

export const FETCH_JOBS = 'FETCH_JOBS'
export const JOB_CREATED = 'JOB_CREATED'
export const JOB_CREATION_FAILED = 'JOB_CREATION_FAILED'
export const JOBS_WORKER_ERROR = 'JOBS_WORKER_ERROR'
export const JOBS_WORKER_STARTED = 'JOBS_WORKER_STARTED'
export const JOBS_WORKER_STOPPED = 'JOBS_WORKER_STOPPED'
export const RECEIVE_JOBS = 'RECEIVE_JOBS'
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
          type: JOB_CREATED,
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
          type: JOB_CREATION_FAILED,
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
          type: JOBS_WORKER_STOPPED
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
    dispatch({type: JOBS_WORKER_STARTED})
  }
}

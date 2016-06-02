import {Client} from '../utils/piazza-client'
import {GATEWAY} from '../config'

export const JOB_CREATED = 'JOB_CREATED'
export const JOB_CREATION_FAILED = 'JOB_CREATION_FAILED'
export const FETCH_JOBS = 'FETCH_JOBS'
export const RECEIVE_JOBS = 'RECEIVE_JOBS'

const STATUS_ERROR = 'Error'
const STATUS_RUNNING = 'Running'
const STATUS_SUCCESS = 'Success'
const STATUS_TIMED_OUT = 'Timed Out'

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
    // HACK
      .then(response => {
        if (!response.ok) {
          throw new Error(`HttpError (code=${response.status})`)
        }
        return response.text()
      })
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

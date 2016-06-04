import {Client} from '../utils/piazza-client'
import * as worker from './workers/algorithms'
import {GATEWAY, ALGORITHMS_WORKER} from '../config'

//
// Action Types
//

export const FETCH_ALGORITHMS = 'FETCH_ALGORITHMS'
export const FETCH_ALGORITHMS_SUCCESS = 'FETCH_ALGORITHMS_SUCCESS'
export const START_ALGORITHMS_WORKER = 'START_ALGORITHMS_WORKER'
export const STOP_ALGORITHMS_WORKER = 'STOP_ALGORITHMS_WORKER'
export const ALGORITHMS_WORKER_ERROR = 'ALGORITHMS_WORKER_ERROR'

//
// Action Creators
//

export function startAlgorithmsWorkerIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.workers.algorithms.running) {
      return
    }
    if (state.workers.algorithms.error) {
      return
    }
    const client = new Client(GATEWAY, state.login.authToken)
    worker.start(client, ALGORITHMS_WORKER.INTERVAL, {
      shouldRun() {
        return !state.algorithms.fetching
      },
      onFailure(err) {
        dispatch(algorithmsWorkerError(err))
      },
      beforeFetch() {
        dispatch(fetchAlgorithms())
      },
      onTerminate() {
        dispatch(stopAlgorithmsWorker())
      },
      onUpdate(records) {
        dispatch(fetchAlgorithmsSuccess(records))
      }
    })
    dispatch(startAlgorithmsWorker())
  }
}

//
// Internals
//

function algorithmsWorkerError(err) {
  return {
    type: ALGORITHMS_WORKER_ERROR,
    err
  }
}

function fetchAlgorithms() {
  return {
    type: FETCH_ALGORITHMS
  }
}

function fetchAlgorithmsSuccess(records) {
  return {
    type: FETCH_ALGORITHMS_SUCCESS,
    records
  }
}

function startAlgorithmsWorker() {
  return {
    type: START_ALGORITHMS_WORKER
  }
}

function stopAlgorithmsWorker() {
  return {
    type: STOP_ALGORITHMS_WORKER
  }
}

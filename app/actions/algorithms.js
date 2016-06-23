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
  return (dispatch, getState) => {
    dispatch({
      type: START_ALGORITHMS_WORKER
    })

    const state = getState()
    const client = new Client(GATEWAY, state.authentication.token)
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
  }
}

function stopAlgorithmsWorker() {
  return {
    type: STOP_ALGORITHMS_WORKER
  }
}

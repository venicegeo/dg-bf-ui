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
import {GATEWAY} from '../config'

//
// Action Types
//

export const DISCOVER_EXECUTOR = 'DISCOVER_EXECUTOR'
export const DISCOVER_EXECUTOR_SUCCESS = 'DISCOVER_EXECUTOR_SUCCESS'
export const DISCOVER_EXECUTOR_ERROR = 'DISCOVER_EXECUTOR_ERROR'

//
// Action Creators
//

export function discoverExecutorIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.executor.serviceId || state.executor.discovering) {
      return
    }
    dispatch(discoverExecutor())
  }
}

const discoverExecutorError = (err) => ({
  type: DISCOVER_EXECUTOR_ERROR,
  err,
})

const discoverExecutorSuccess = (serviceId, url) => ({
  type: DISCOVER_EXECUTOR_SUCCESS,
  serviceId,
  url,
})

function discoverExecutor() {
  return (dispatch, getState) => {
    dispatch({
      type: DISCOVER_EXECUTOR
    })

    const client = new Client(GATEWAY, getState().authentication.token)
    client.getServices({pattern: '^bf-handle'})
      .then(([executor]) => {
        if (executor) {
          dispatch(discoverExecutorSuccess(executor.serviceId, executor.url.replace(/\/execute$/, '')))
        }
        else {
          dispatch(discoverExecutorError('Could not find Beachfront API service'))
        }
      })
      .catch(err => {
        dispatch(discoverExecutorError(err))
      })
  }
}

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

import {GATEWAY} from '../config'

//
// Action Types
//

export const CREATE_PRODUCT_LINE = 'CREATE_PRODUCT_LINE'
export const CREATE_PRODUCT_LINE_SUCCESS = 'CREATE_PRODUCT_LINE_SUCCESS'
export const CREATE_PRODUCT_LINE_ERROR = 'CREATE_PRODUCT_LINE_ERROR'
export const CHANGE_PRODUCT_LINE_NAME = 'CHANGE_PRODUCT_LINE_NAME'
export const SELECT_PRODUCT_LINE_ALGORITHM = 'SELECT_PRODUCT_LINE_ALGORITHM'

//
// Action Creators
//

export const changeProductLineName = (name) => ({
  type: CHANGE_PRODUCT_LINE_NAME,
  name,
})

export const createProductLineSuccess = () => ({
  type: CREATE_PRODUCT_LINE_SUCCESS,
})

export const createProductLineError = (err) => ({
  type: CREATE_PRODUCT_LINE_ERROR,
  err,
})

export function createProductLine() {
  return (dispatch, getState) => {
    const state = getState()

    dispatch({
      type: CREATE_PRODUCT_LINE,
    })

    return fetch(`${state.executor.url}/newProductLine`, {
      method: 'POST',
      body: JSON.stringify({
        cloudCover:  state.search.cloudCover,
        eventTypeId: [state.catalog.eventTypeId],
        minX:        state.search.bbox[0],
        minY:        state.search.bbox[1],
        maxX:        state.search.bbox[2],
        maxY:        state.search.bbox[3],
        minDate:     state.draftProductLine.dateToStart,
        maxDate:     state.draftProductLine.dateToEnd,
        name:        state.draftProductLine.name,
        serviceId:   state.executor.serviceId,
        bfInputJSON: {
          algoType:    state.draftProductLine.algorithm.type,
          dbAuthToken: state.catalog.apiKey,
          pzAddr:      GATEWAY,
          pzAuthToken: state.authentication.token,
          svcURL:      state.draftProductLine.algorithm.url,
        },
      }),
    })
      .then(checkResponse)
      .then(data => {
        if (!data.triggerId || data.layerId) {
          throw new Error('Server response is missing required data')
        }
        dispatch(createProductLineSuccess())
      })
      .catch(err => {
        dispatch(createProductLineError(err))
      })
  }
}

export const selectProductLineAlgorithm = (algorithm) => ({
  type: SELECT_PRODUCT_LINE_ALGORITHM,
  algorithm,
})

//
// Helpers
//

function checkResponse(response) {
  if (!response.ok) {
    throw new Error(`HttpError: (code=${response.status})`)
  }
  return response.json()
}

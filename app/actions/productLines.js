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
import {Client} from '../utils/piazza-client'

import {
  KEY_CREATED_ON,
  KEY_EXPIRES_ON,
  KEY_IMAGE_CLOUDCOVER,
  KEY_IMAGE_SENSOR,
  KEY_EVENT_TYPE_ID,
  KEY_NAME,
} from '../constants'

export const FETCH_PRODUCT_LINES = 'FETCH_PRODUCT_LINES'
export const FETCH_PRODUCT_LINES_SUCCESS = 'FETCH_PRODUCT_LINES_SUCCESS'
export const FETCH_PRODUCT_LINES_ERROR = 'FETCH_PRODUCT_LINES_ERROR'

const fetchProductLinesSuccess = (records) => ({
  type: FETCH_PRODUCT_LINES_SUCCESS,
  records,
})

const fetchProductLinesError = (err) => ({
  type: FETCH_PRODUCT_LINES_ERROR,
  err,
})

export function fetchProductLines() {
  return (dispatch, getState) => {
    dispatch({
      type: FETCH_PRODUCT_LINES,
    })
    const state = getState()
    return fetch(`${state.executor.url}/getProductLines`, {
      body: JSON.stringify({
        pzAuthToken: state.authentication.token,
        pzAddr: GATEWAY,
      }),
      headers: {'content-type': 'application/json'},
      method: 'POST'
    })
      .then(checkResponse)
      .then(extractRecords)
      .then((productLines => {
        dispatch(fetchProductLinesSuccess(productLines))
      }))
      .catch(err => {
        dispatch(fetchProductLinesError(err))
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
  throw httpError(response)
}

function httpError(response) {
  const err = new Error(`HttpError: (code=${response.status})`)
  err.code = response.status
  return err
}

function extractRecords(data) {
  return data.map(datum => ({
    id: datum.triggerId,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [datum.minX, datum.minY],
        [datum.minX, datum.maxY],
        [datum.maxX, datum.maxY],
        [datum.maxX, datum.minY],
        [datum.minX, datum.minY],
      ]]
    },
    properties: {
      [KEY_CREATED_ON]:       datum.minDate,
      [KEY_EXPIRES_ON]:       datum.maxDate,
      [KEY_IMAGE_CLOUDCOVER]: datum.cloudCover,
      [KEY_IMAGE_SENSOR]:     datum.sensorName,
      [KEY_EVENT_TYPE_ID]:    datum.eventTypeId.pop(),
      [KEY_NAME]:             datum.name,
    },
    type: 'Feature',
  }))
}

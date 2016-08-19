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

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_EXPIRES_ON,
  KEY_IMAGE_CLOUDCOVER,
  KEY_IMAGE_SENSOR,
  KEY_EVENT_TYPE_ID,
  KEY_NAME,
  KEY_OWNER,
  KEY_SPATIAL_FILTER_NAME,
  KEY_STARTS_ON,
  KEY_STATUS,
  KEY_WMS_LAYER_ID,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
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
    const algorithmNames = generateAlgorithmNamesHash(state.algorithms.records)
    const filterNames = generateFilterNamesHash(state.catalog.filters)
    return fetch(`${state.executor.url}/getProductLines`, {
      body: JSON.stringify({
        pzAuthToken: state.authentication.token,
        pzAddr: GATEWAY,
      }),
      headers: {'content-type': 'application/json'},
      method: 'POST',
    })
      .then(checkResponse)
      .then(extractRecords(algorithmNames, filterNames))
      .then(records => {
        dispatch(fetchProductLinesSuccess(records))
      })
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
  throw new Error(`HttpError: (code=${response.status})`)
}

function extractRecords(algorithmNames, filterNames) {
  return data => data.map(datum => ({
    id: datum.triggerId,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [datum.minX, datum.minY],
        [datum.minX, datum.maxY],
        [datum.maxX, datum.maxY],
        [datum.maxX, datum.minY],
        [datum.minX, datum.minY],
      ]],
    },
    properties: {
      [KEY_OWNER]:               datum.owner,
      [KEY_ALGORITHM_NAME]:      algorithmNames[datum.bfInputJSON.svcURL] || 'Unknown',
      [KEY_CREATED_ON]:          datum.minDate,
      [KEY_EVENT_TYPE_ID]:       datum.eventTypeId.pop(),
      [KEY_EXPIRES_ON]:          datum.maxDate,
      [KEY_IMAGE_CLOUDCOVER]:    datum.cloudCover,
      [KEY_IMAGE_SENSOR]:        datum.sensorName,
      [KEY_NAME]:                datum.name,
      [KEY_STATUS]:              isActive(datum.maxDate) ? STATUS_ACTIVE : STATUS_INACTIVE,
      [KEY_SPATIAL_FILTER_NAME]: filterNames[datum.subindexId],
      [KEY_STARTS_ON]:           datum.minDate,
      [KEY_WMS_LAYER_ID]:        datum.bfInputJSON.lGroupId,
    },
    type: 'Feature',
  }))
}

function generateAlgorithmNamesHash(algorithms) {
  const hash = {}
  for (const algorithm of algorithms) {
    hash[algorithm.url] = algorithm.name
  }
  return hash
}

function generateFilterNamesHash(filters) {
  const hash = {}
  for (const filter of filters) {
    hash[filter.id] = filter.name
  }
  return hash
}

function isActive(maxDate) {
  return !maxDate || new Date(maxDate).getTime() < Date.now()
}

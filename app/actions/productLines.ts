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
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  TYPE_PRODUCT_LINE,
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
      algorithmName:     algorithmNames[datum.bfInputJSON.svcURL] || 'Unknown',
      createdOn:         datum.minDate,
      detectionsLayerId: datum.bfInputJSON.lGroupId,
      eventTypeId:       datum.eventTypeId.pop(),
      expiresOn:         datum.maxDate,
      imageCloudCover:   datum.cloudCover,
      imageSensorName:   datum.sensorName,
      name:              datum.name,
      owner:             datum.owner,
      status:            isActive(datum.maxDate) ? STATUS_ACTIVE : STATUS_INACTIVE,
      spatialFilterName: filterNames[datum.subindexId],
      startsOn:          datum.minDate,
      type:              TYPE_PRODUCT_LINE,
    },
    type: 'Feature',
  } as beachfront.ProductLine))
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

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

import moment from 'moment'
import {importRecordById as importJobRecordById} from '../utils/import-job-record'
import {Client} from '../utils/piazza-client'
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

export function fetchJobs({
  productLineId,
  sinceDate,
  algorithms,
  executorUrl,
  sessionToken,
}) {
  return fetch(`${executorUrl}/listProdLineJobs`, {
    body: JSON.stringify({
      // FIXME -- I can has property name consistency, bfhandle?
      TriggerId:   productLineId,
      PzAuthToken: sessionToken,
      PzAddr:      GATEWAY,
      PerPage:     '200',  // HACK -- see explanation below
    }),
    headers: {'content-type': 'application/json'},
    method: 'POST'
  })
    .then(checkResponse)

    // HACK HACK HACK HACK HACK HACK HACK
    .then(ids => {
      const client = new Client(GATEWAY, sessionToken)
      const algorithmNames = generateAlgorithmNamesHash(algorithms)
      return __keepFetchingJobRecordsUntilSinceDate__(client, ids, algorithmNames, productLineId, sinceDate)
    })
    // HACK HACK HACK HACK HACK HACK HACK

    .catch(err => {
      console.error('(productLines:fetchJobs) failed:', err)
      throw err
    })
}

export function fetchProductLines({
  algorithms,
  eventTypeId,
  executorUrl,
  filters,
  serviceId,
  sessionToken,
}) {
  return fetch(`${executorUrl}/getProductLines`, {
    body: JSON.stringify({
      eventTypeId,
      serviceId,
      pzAuthToken: sessionToken,
      pzAddr:      GATEWAY,
    }),
    headers: {'content-type': 'application/json'},
    method: 'POST'
  })
    .then(checkResponse)
    .then(extractRecords(algorithms, filters))
    .catch(err => {
      console.error('(productLines:fetchProductLines) failed:', err)
      throw err
    })
}

//
// Helpers
//

function checkResponse(response) {
  if (response.ok) {
    return response.json()
  }
  throw Object.assign(new Error(`HttpError: (code=${response.status})`), {
    code: response.status
  })
}

function extractRecords(algorithms, filters) {
  const algorithmNames = generateAlgorithmNamesHash(algorithms)
  const filterNames = generateFilterNamesHash(filters)
  return data => data.productLines.map(datum => ({
    id: datum.Id,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [parseFloat(datum.minX), parseFloat(datum.minY)],
        [parseFloat(datum.minX), parseFloat(datum.maxY)],
        [parseFloat(datum.maxX), parseFloat(datum.maxY)],
        [parseFloat(datum.maxX), parseFloat(datum.minY)],
        [parseFloat(datum.minX), parseFloat(datum.minY)],
      ]]
    },
    properties: {
      [KEY_OWNER]:               datum.createdBy,
      [KEY_ALGORITHM_NAME]:      algorithmNames[datum.bfInputJSON.svcURL] || 'Unknown',
      [KEY_CREATED_ON]:          datum.minDate,
      [KEY_EVENT_TYPE_ID]:       datum.eventTypeId.pop(),
      [KEY_EXPIRES_ON]:          datum.maxDate,
      [KEY_IMAGE_CLOUDCOVER]:    parseFloat(datum.cloudCover),
      [KEY_IMAGE_SENSOR]:        datum.sensorName,
      [KEY_NAME]:                datum.name,
      [KEY_STATUS]:              isActive(datum.maxDate) ? STATUS_ACTIVE : STATUS_INACTIVE,
      [KEY_SPATIAL_FILTER_NAME]: filterNames[datum.spatialFilterId] || '',
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
  return !maxDate || new Date(maxDate).getTime() < Date.now().getTime()
}

// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
/*
  Until bf-handle decides to solve the fan-out problem server-side, this is
  the world we have to live in...

  The overall strategy here is:
    (1) grab as many job IDs are we're comfortable hammering Piazza for
    (2) select first 10 job IDs that have not yet been loaded
    (3) fetch those jobs
    (4) if oldest job's creation date >= sinceDate & more to load, go to #2

  Assumptions:
    - 200 jobs should be enough to satisfy the user's curiosity
    - Piazza doesn't mind being hammered with 200(*4) HTTP requests over the
      course of ~5 minutes
 */
function __keepFetchingJobRecordsUntilSinceDate__(client, ids, algorithmNames, productLineId, sinceDate) {
  const count = 10
  return new Promise((resolve, reject) => {
    const records = []
    const cutoff = moment(sinceDate)

    ;(function ___fetchNextBatch___(remainingIds) {
      console.debug('(productLines:__keepFetchingJobRecordsUntilSinceDate__) load %s jobs <%s>', count, sinceDate)
      const promises = remainingIds.slice(0, count).map(dataId => importJobRecordById(client, dataId, algorithmNames))
      return Promise.all(promises)
        .then(batch => {
          for (const record of batch) {
            console.debug('(productLines:__keepFetchingJobRecordsUntilSinceDate__) inspect ', record.properties[KEY_CREATED_ON])
            if (moment(record.properties[KEY_CREATED_ON]).isAfter(cutoff)) {
              records.push(record)
            }
            else {
              console.debug('(productLines:__keepFetchingJobRecordsUntilSinceDate__) reached since date')
              resolve(records)
              return
            }
          }
          if (!remainingIds.length) {
            console.debug('(productLines:__keepFetchingJobRecordsUntilSinceDate__) no more jobs to load')
            resolve(records)
            return
          }
          ___fetchNextBatch___(remainingIds.slice(count))
        }, reject)
    }(ids))
  })
}
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK


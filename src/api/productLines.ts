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

import * as moment from 'moment'
import {getClient} from './session'
import {importByDataId} from '../utils/import-job-record'

import {
  REQUIREMENT_BANDS,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  TYPE_PRODUCT_LINE,
} from '../constants'

export function create({
  algorithm,
  bbox,
  catalogApiKey,
  cloudCover,
  dateStart,
  dateStop,
  eventTypeId,
  executorServiceId,
  executorUrl,
  filter,
  name,
}) {
  const {gateway, sessionToken} = getClient()
  return fetch(`${executorUrl}/newProductLine`, {
    method: 'POST',
    body: JSON.stringify({
      cloudCover:      cloudCover,
      eventTypeId:     eventTypeId,
      minx:            bbox[0],
      miny:            bbox[1],
      maxx:            bbox[2],
      maxy:            bbox[3],
      minDate:         dateStart,
      maxDate:         dateStop,
      name:            name,
      serviceId:       executorServiceId,
      spatialFilterId: filter,
      bfInputJSON: {
        algoType:    algorithm.type,
        bands:       algorithm.requirements.find(a => a.name === REQUIREMENT_BANDS).literal.split(','),
        dbAuthToken: catalogApiKey,
        pzAddr:      gateway,
        pzAuthToken: sessionToken,
        svcURL:      algorithm.url,
        tideURL:     'https://tideprediction.stage.geointservices.io/',  // HACK
      },
    }),
  })
    .then(checkResponse)
    .then(data => {
      if (!data.triggerId || !data.layerGroupId) {
        throw new Error('Server response is missing required data')
      }
      return data
    })
    .catch(err => {
      console.error('(productLines:create) failed:', err)
      throw err
    })
}

export function fetchJobs({
  productLineId,
  sinceDate,
  algorithms,
  executorUrl,
}) {
  const {gateway, sessionToken} = getClient()
  return fetch(`${executorUrl}/resultsByProductLine`, {
    body: JSON.stringify({
      triggerId:   productLineId,
      pzAuthToken: sessionToken,
      pzAddr:      gateway,
      perPage:     '200',  // HACK -- see explanation below
    }),
    headers: {'content-type': 'application/json'},
    method: 'POST',
  })
    .then(checkResponse)

    // HACK HACK HACK HACK HACK HACK HACK
    .then(ids => {
      const client = getClient()
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
}): Promise<beachfront.ProductLine[]> {
  const {gateway, sessionToken} = getClient()
  return fetch(`${executorUrl}/getProductLines`, {
    body: JSON.stringify({
      eventTypeId,
      serviceId,
      pzAuthToken: sessionToken,
      pzAddr:      gateway,
    }),
    headers: {'content-type': 'application/json'},
    method: 'POST',
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
    code: response.status,
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
        [datum.minx, datum.miny],
        [datum.minx, datum.maxy],
        [datum.maxx, datum.maxy],
        [datum.maxx, datum.miny],
        [datum.minx, datum.miny],
      ]],
    },
    properties: {
      algorithmName:     algorithmNames[datum.bfInputJSON.svcURL] || 'Unknown',
      createdOn:         datum.minDate,
      detectionsLayerId: 'piazza:' + datum.bfInputJSON.lGroupId,
      eventTypeId:       datum.eventTypeId,
      expiresOn:         datum.maxDate,
      name:              datum.name,
      owner:             datum.createdBy,
      sceneCloudCover:   datum.cloudCover,
      sceneSensorName:   datum.sensorName,
      spatialFilterName: filterNames[datum.spatialFilterId] || '',
      startsOn:          datum.minDate,
      status:            isActive(datum.maxDate) ? STATUS_ACTIVE : STATUS_INACTIVE,
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
  return !maxDate || moment(maxDate).isAfter(moment())
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

    ;(function ___fetchNextBatch___(remainingIds: string[]) {  // tslint:disable-line
      console.debug('(productLines:__keepFetchingJobRecordsUntilSinceDate__) load %s jobs <%s>', count, sinceDate)
      const promises = remainingIds.slice(0, count).map(dataId => importByDataId(client, dataId, algorithmNames))
      return Promise.all(promises)
        .then(batch => {
          for (const record of batch) {
            console.debug('(productLines:__keepFetchingJobRecordsUntilSinceDate__) inspect ', record.properties.createdOn)
            if (moment(record.properties.createdOn).isAfter(cutoff)) {
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
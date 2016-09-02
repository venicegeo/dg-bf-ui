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
import {Client} from '../utils/piazza-client'
import * as worker from './workers/jobs'
import {
  GATEWAY,
  JOBS_WORKER,
  SCHEMA_VERSION,
} from '../config'

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_GEOJSON_DATA_ID,
  KEY_WMS_LAYER_ID,
  KEY_WMS_URL,
  KEY_IMAGE_ID,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_SENSOR,
  KEY_NAME,
  KEY_SCHEMA_VERSION,
  KEY_STATUS,
  KEY_TYPE,
  KEY_THUMBNAIL,
  REQUIREMENT_BANDS,
  STATUS_RUNNING,
  TYPE_JOB,
} from '../constants'

export function createJob({
  catalogApiKey,
  executorServiceId,
  name,
  algorithm,
  image,
  sessionToken,
}) {
  const client = new Client(GATEWAY, sessionToken)
  return client.post('execute-service', {
    dataInputs: {
      body: {
        content: JSON.stringify({
          algoType:      algorithm.type,
          svcURL:        algorithm.url,
          pzAuthToken:   client.authToken,
          pzAddr:        client.gateway,
          dbAuthToken:   catalogApiKey,
          bands:         algorithm.requirements.find(a => a.name === REQUIREMENT_BANDS).literal.split(','),
          metaDataJSON:  image,
          resultName:    name,
        }),
        type:     'body',
        mimeType: 'application/json'
      }
    },
    dataOutput: [
      {
        mimeType: 'application/json',
        type:     'text'
      }
    ],
    serviceId: executorServiceId
  })
    .then(id => ({
      id,
      geometry: image.geometry,
      properties: {
        [KEY_ALGORITHM_NAME]:    algorithm.name,
        [KEY_CREATED_ON]:        moment().toISOString(),
        [KEY_IMAGE_CAPTURED_ON]: moment(image.properties[KEY_IMAGE_CAPTURED_ON]).toISOString(),
        [KEY_IMAGE_ID]:          image.id,
        [KEY_IMAGE_SENSOR]:      image.properties[KEY_IMAGE_SENSOR],
        [KEY_NAME]:              name,
        [KEY_STATUS]:            STATUS_RUNNING,
        [KEY_THUMBNAIL]:         image.properties[KEY_THUMBNAIL],
        [KEY_TYPE]:              TYPE_JOB,
        [KEY_SCHEMA_VERSION]:    SCHEMA_VERSION,
      },
      type: 'Feature',
    }))
    .catch(err => {
      console.error('(jobs:create) could not execute:', err)
      throw err
    })
}

export function startWorker({
  sessionToken,
  getRecords,
  onTerminate,
  onUpdate,
  onError,
}) {
  worker.start({
    client:   new Client(GATEWAY, sessionToken),
    interval: JOBS_WORKER.INTERVAL,
    ttl:      JOBS_WORKER.JOB_TTL,
    onError,
    onTerminate,

    getRunningJobs() {
      return getRecords().filter(j => j.properties[KEY_STATUS] === STATUS_RUNNING)
    },

    onUpdate(jobId, status, geojsonDataId, wmsLayerId, wmsUrl) {
      const record = getRecords().find(j => j.id === jobId)
      const updatedRecord = Object.assign({}, record, {
        properties: Object.assign({}, record.properties, {
          [KEY_STATUS]:          status,
          [KEY_GEOJSON_DATA_ID]: geojsonDataId,
          [KEY_WMS_LAYER_ID]:    wmsLayerId,
          [KEY_WMS_URL]:         wmsUrl,
        })
      })
      onUpdate(updatedRecord)
    },
  })
}

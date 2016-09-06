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

import {
  SCHEMA_VERSION,
} from '../config'

import {
  extractAlgorithmUrl,
  extractDateCreated,
  extractGeometry,
  extractGeojsonDataId,
  extractSceneCaptureDate,
  extractSceneId,
  extractSensorName,
  extractName,
  parseString,
} from './execution-output'

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_GEOJSON_DATA_ID,
  KEY_IMAGE_ID,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_SENSOR,
  KEY_NAME,
  KEY_SCHEMA_VERSION,
  KEY_STATUS,
  KEY_TYPE,
  KEY_WMS_LAYER_ID,
  STATUS_SUCCESS,
  TYPE_JOB,
} from '../constants'

export function importByDataId(client, dataId, algorithmNames) {
  return client.getFile(dataId)
    .then(parseString)
    .then(executionOutput => ({
      id: dataId,
      geometry: extractGeometry(executionOutput),
      properties: {
        [KEY_ALGORITHM_NAME]:    algorithmNames[extractAlgorithmUrl(executionOutput)] || 'Unknown',
        [KEY_CREATED_ON]:        extractDateCreated(executionOutput),
        [KEY_IMAGE_CAPTURED_ON]: extractSceneCaptureDate(executionOutput),
        [KEY_GEOJSON_DATA_ID]:   extractGeojsonDataId(executionOutput),
        [KEY_IMAGE_ID]:          extractSceneId(executionOutput),
        [KEY_IMAGE_SENSOR]:      extractSensorName(executionOutput),
        [KEY_NAME]:              extractName(executionOutput),
        [KEY_STATUS]:            STATUS_SUCCESS,
        [KEY_TYPE]:              TYPE_JOB,
        [KEY_SCHEMA_VERSION]:    SCHEMA_VERSION,
        [KEY_WMS_LAYER_ID]:      extractGeojsonDataId(executionOutput),
      },
      type: 'Feature',
    }))
    .catch(err => {
      throw Object.assign(err, {
        dataId,
        message: `ImportError: ${err.message}`,
        stack:   err.stack,
      })
    })
}

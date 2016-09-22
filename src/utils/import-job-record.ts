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

import {Client} from './piazza-client'
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
  SCHEMA_VERSION,
} from '../config'

import {
  STATUS_SUCCESS,
  TYPE_JOB,
} from '../constants'

export function importByDataId(client: Client, dataId: string, algorithmNames: Map<string, string>): Promise<beachfront.Job> {
  return client.getFile(dataId)
    .then(parseString)
    .then(executionOutput => ({
      id: dataId,
      geometry: extractGeometry(executionOutput),
      properties: {
        __schemaVersion__: SCHEMA_VERSION,
        algorithmName:     algorithmNames[extractAlgorithmUrl(executionOutput)] || 'Unknown',
        createdOn:         extractDateCreated(executionOutput),
        detectionsDataId:  extractGeojsonDataId(executionOutput),
        detectionsLayerId: extractGeojsonDataId(executionOutput),
        name:              extractName(executionOutput),
        sceneId:           extractSceneId(executionOutput),
        sceneCaptureDate:  extractSceneCaptureDate(executionOutput),
        sceneSensorName:   extractSensorName(executionOutput),
        status:            STATUS_SUCCESS,
        type:              TYPE_JOB,
      },
      type: 'Feature',
    } as beachfront.Job))
    .catch(err => {
      throw Object.assign(err, {
        dataId,
        message: `ImportError: ${err.message}`,
        stack:   err.stack,
      })
    })
}

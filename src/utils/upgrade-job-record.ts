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

import {
  SCHEMA_VERSION,
} from '../config'
import {
  STATUS_RUNNING,
  TYPE_JOB,
} from '../constants'

export function upgradeIfNeeded(record) {
  try {
    const recordVersion = record.properties['beachfront:schemaVersion'] || record.properties.__schemaVersion__
    switch (recordVersion) {
    case SCHEMA_VERSION: return record
    case 3: return upgradeFromV3(record)
    case 2: return upgradeFromV2(record)
    case 1: return upgradeFromV1(record)
    default: return null  // Discard incompatible record
    }
  } catch (err) {
    emitFailure(err, record)
  }
}

function upgradeFromV3(legacyRecord) {
  console.debug('(upgrade-job-record:upgradeFromV3)', legacyRecord)
  return Object.assign({}, legacyRecord, {
    properties: {
      __schemaVersion__: SCHEMA_VERSION,
      algorithmName:     legacyRecord.properties['beachfront:algorithmName'],
      createdOn:         legacyRecord.properties['beachfront:createdOn'],
      name:              legacyRecord.properties['beachfront:name'],
      sceneId:           legacyRecord.properties['beachfront:imageId'],
      sceneCaptureDate:  legacyRecord.properties['acquiredDate'],  // tslint:disable-line
      sceneSensorName:   legacyRecord.properties['sensorName'],  // tslint:disable-line
      type:              TYPE_JOB,

      // Force a re-fetch to populate the detections fields
      status:            STATUS_RUNNING,
    },
  } as beachfront.Job)
}

function upgradeFromV2(legacyRecord) {
  console.debug('(upgrade-job-record:upgradeFromV2)', legacyRecord)
  return Object.assign({}, legacyRecord, {
    properties: {
      __schemaVersion__: SCHEMA_VERSION,
      algorithmName:     legacyRecord.properties['beachfront:algorithmName'],
      createdOn:         legacyRecord.properties['beachfront:createdOn'],
      name:              legacyRecord.properties['beachfront:name'],
      sceneId:           legacyRecord.properties['beachfront:imageId'],
      type:              TYPE_JOB,

      // Deduce image metadata
      sceneCaptureDate:  extractLandsatCaptureDate(legacyRecord.properties['beachfront:imageId']),
      sceneSensorName:   extractLandsatSensor(legacyRecord.properties['beachfront:imageId']),

      // Force a re-fetch to populate the detections fields
      status:            STATUS_RUNNING,
    },
  } as beachfront.Job)
}

function upgradeFromV1(legacyRecord) {
  console.debug('(upgrade-job-record:upgradeFromV1)', legacyRecord)
  return Object.assign({}, legacyRecord, {
    properties: {
      __schemaVersion__: SCHEMA_VERSION,
      algorithmName:     legacyRecord.properties['beachfront:algorithmName'],
      createdOn:         legacyRecord.properties['beachfront:createdOn'],
      sceneId:           legacyRecord.properties['beachfront:imageId'],
      name:              legacyRecord.properties['beachfront:name'],
      type:              TYPE_JOB,

      // Deduce image metadata
      sceneCaptureDate:  extractLandsatCaptureDate(legacyRecord.properties['beachfront:imageId']),
      sceneSensorName:   extractLandsatSensor(legacyRecord.properties['beachfront:imageId']),

      // Force a re-fetch to populate the detections fields
      status:            STATUS_RUNNING,
    },
  } as beachfront.Job)
}

function decomposeLandsatId(id) {
  return id.match(/^(?:landsat:)?(L[COMET][1478])\d{6}(\d{4})(\d{3})[A-Z]{3}\d{2}$/) || []
}

function extractLandsatCaptureDate(imageId) {
  const [, , year, julianDate] = decomposeLandsatId(imageId)
  return moment(`${year}-${julianDate}`, 'YYYY-DDD').utc().startOf('day').toISOString()
}

function extractLandsatSensor(imageId) {
  const [, platform] = decomposeLandsatId(imageId)
  switch (platform) {
  case 'LO8':
  case 'LT8':
  case 'LC8': return 'Landsat8'
  case 'LE7': return 'Landsat7'
  default: return 'Unknown'
  }
}

function emitFailure(err, record) {
  console.warn(`\
-----------------------------------------------------------
(upgrade-job-record) error: ${err.message}

RECORD:

${JSON.stringify(record, null, 4)}

-----------------------------------------------------------
`)
}
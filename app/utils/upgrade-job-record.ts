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

import * as ol from 'openlayers'
import * as moment from 'moment'

import {
  SCHEMA_VERSION,
} from '../config'
import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_GEOJSON_DATA_ID,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_ID,
  KEY_IMAGE_SENSOR,
  KEY_NAME,
  KEY_SCHEMA_VERSION,
  KEY_STATUS,
  KEY_TYPE,
  STATUS_RUNNING,
  TYPE_JOB,
} from '../constants'

export function upgradeIfNeeded(record) {
  const recordVersion = record.properties ? record.properties[KEY_SCHEMA_VERSION] : 0
  switch (recordVersion) {
  case SCHEMA_VERSION: return record
  case 2: return upgradeFromV2(record)
  case 1: return upgradeFromV1(record)
  case 0: return upgradeFromV0(record)
  default: return null  // Discard incompatible record
  }
}

function upgradeFromV2(legacyRecord) {
  console.debug('upgrade-job-record:upgradeFromV2', legacyRecord)
  return Object.assign({}, legacyRecord, {
    properties: Object.assign({}, legacyRecord.properties, {
      [KEY_SCHEMA_VERSION]: SCHEMA_VERSION,

      // Deduce image metadata
      [KEY_IMAGE_CAPTURED_ON]: extractLandsatCaptureDate(legacyRecord.properties[KEY_IMAGE_ID]),
      [KEY_IMAGE_SENSOR]: extractLandsatSensor(legacyRecord.properties[KEY_IMAGE_ID]),
    }),
  })
}

function upgradeFromV1(legacyRecord) {
  console.debug('upgrade-job-record:upgradeFromV1', legacyRecord)
  return Object.assign({}, legacyRecord, {
    properties: Object.assign({}, legacyRecord.properties, {
      [KEY_SCHEMA_VERSION]: SCHEMA_VERSION,

      // Force a re-fetch to populate the missing fields
      [KEY_STATUS]: STATUS_RUNNING,

      // Prune dead properties
      'beachfront:resultId': undefined,

      // Deduce image metadata
      [KEY_IMAGE_CAPTURED_ON]: extractLandsatCaptureDate(legacyRecord.properties[KEY_IMAGE_ID]),
      [KEY_IMAGE_SENSOR]: extractLandsatSensor(legacyRecord.properties[KEY_IMAGE_ID]),
    }),
  })
}

function upgradeFromV0(legacyRecord) {
  console.debug('upgrade-job-record:upgradeFromV0', legacyRecord)
  try {
    return {
      id: legacyRecord.id,
      properties: {
        [KEY_IMAGE_ID]:        legacyRecord.imageId,
        [KEY_ALGORITHM_NAME]:  legacyRecord.algorithmName || 'Unknown Algorithm',
        [KEY_CREATED_ON]:      legacyRecord.createdOn || new Date().toISOString(),
        [KEY_NAME]:            legacyRecord.name || legacyRecord.createdOn || 'Untitled Job',
        [KEY_GEOJSON_DATA_ID]: legacyRecord.resultId,
        [KEY_STATUS]:          STATUS_RUNNING,
        [KEY_TYPE]:            TYPE_JOB,
        [KEY_SCHEMA_VERSION]:  SCHEMA_VERSION,

        // Deduce image metadata
        [KEY_IMAGE_CAPTURED_ON]: extractLandsatCaptureDate(legacyRecord.imageId),
        [KEY_IMAGE_SENSOR]: extractLandsatSensor(legacyRecord.imageId),
      },
      geometry: bboxToGeometry(legacyRecord.bbox),
      type: 'Feature',
    }
  } catch (err) {
    console.warn(`\
--------------------------------------------------------------------------------
Could not upgrade legacy record

Error:
${err.stack}

Record:
${JSON.stringify(legacyRecord, null, 2)} 
--------------------------------------------------------------------------------`)
  }
}

function bboxToGeometry(bbox) {
  return new ol.format.GeoJSON().writeGeometryObject(ol.geom.Polygon.fromExtent(bbox))
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

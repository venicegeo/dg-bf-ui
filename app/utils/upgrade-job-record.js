import ol from 'openlayers'

import {
  KEY_IMAGE_ID,
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_NAME,
  KEY_RESULT_ID,
  KEY_STATUS,
  KEY_TYPE,
  KEY_VERSION,
  KEY_THUMBNAIL,
  STATUS_RUNNING,
  TYPE_JOB,
} from '../constants'

const CURRENT_VERSION = 1

export function upgradeIfNeeded(record) {
  if (typeof record.properties === 'undefined'
    || record.properties[KEY_VERSION] < CURRENT_VERSION) {
    return upgrade(record)
  }
  return record
}

export function upgrade(legacyRecord) {
  try {
    return {
      id: legacyRecord.id,
      properties: {
        [KEY_IMAGE_ID]:       legacyRecord.imageId,
        [KEY_ALGORITHM_NAME]: legacyRecord.algorithmName || 'Unknown Algorithm',
        [KEY_CREATED_ON]:     legacyRecord.createdOn || new Date().toISOString(),
        [KEY_NAME]:           legacyRecord.name || legacyRecord.createdOn || 'Untitled Job',
        [KEY_RESULT_ID]:      legacyRecord.resultId,
        [KEY_STATUS]:         STATUS_RUNNING,
        [KEY_TYPE]:           TYPE_JOB,
        [KEY_VERSION]:        CURRENT_VERSION,
        [KEY_THUMBNAIL]:      legacyRecord.thumbnail,
      },
      geometry: bboxToGeometry(legacyRecord.bbox),
      type: 'Feature'
    }
  } catch (err) {
    console.warn(`Could not upgrade legacy record:
--------------------------------------------------------------------------------
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

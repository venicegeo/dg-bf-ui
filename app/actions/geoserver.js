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

import {Client} from '../utils/piazza-client'
import {GATEWAY} from '../config'

//
// Action Types
//

export const DISCOVER_GEOSERVER = 'DISCOVER_GEOSERVER'
export const DISCOVER_GEOSERVER_SUCCESS = 'DISCOVER_GEOSERVER_SUCCESS'
export const DISCOVER_GEOSERVER_ERROR = 'DISCOVER_GEOSERVER_ERROR'

//
// Action Creators
//

export function discoverGeoserverIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.geoserver.url || state.geoserver.discovering) {
      return
    }
    dispatch(discoverGeoserver())
  }
}

const discoverGeoserverError = (err) => ({
  type: DISCOVER_GEOSERVER_ERROR,
  err,
})

const discoverGeoserverSuccess = (url, baselineLayerId) => ({
  type: DISCOVER_GEOSERVER_SUCCESS,
  url,
  baselineLayerId,
})

function discoverGeoserver() {
  return (dispatch, getState) => {
    dispatch({
      type: DISCOVER_GEOSERVER
    })

    const client = new Client(GATEWAY, getState().authentication.token)
    client.getServices({pattern: '^bf-geoserver'})
      .then(([geoserver]) => {
        if (geoserver) {
          dispatch(discoverGeoserverSuccess(geoserver.url, geoserver.resourceMetadata.metadata.baselineLayerId))
        }
        else {
          dispatch(discoverGeoserverError('Could not find Beachfront GeoServer'))
        }
      })
      .catch(err => {
        dispatch(discoverGeoserverError(err))
      })
  }
}

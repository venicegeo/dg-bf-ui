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

export const DISCOVER_CATALOG = 'DISCOVER_CATALOG'
export const DISCOVER_CATALOG_SUCCESS = 'DISCOVER_CATALOG_SUCCESS'
export const DISCOVER_CATALOG_ERROR = 'DISCOVER_CATALOG_ERROR'
export const UPDATE_CATALOG_API_KEY = 'UPDATE_CATALOG_API_KEY'

//
// Action Creators
//

export function discoverCatalogIfNeeded() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.catalog.url || state.catalog.discovering) {
      return
    }
    dispatch(discoverCatalog())
  }
}

export function updateCatalogApiKey(apiKey) {
  return {
    type: UPDATE_CATALOG_API_KEY,
    apiKey
  }
}

const discoverCatalogSuccess = (url, filters, eventTypeId) => ({
  type: DISCOVER_CATALOG_SUCCESS,
  url,
  filters,
  eventTypeId,
})

const discoverCatalogError = (err) => ({
  type: DISCOVER_CATALOG_ERROR,
  err
})

function discoverCatalog() {
  return (dispatch, getState) => {
    dispatch({
      type: DISCOVER_CATALOG
    })

    const authToken = getState().authentication.token
    const client = new Client(GATEWAY, authToken)
    client.getServices({pattern: '^pzsvc-image-catalog'})
      .then(([catalog]) => {
        if (!catalog) {
          throw new Error('Could not find image catalog service')
        }
        return {
          authToken,
          url: catalog.url,
        }
      })
      .then(lookupFilters)
      .then(lookupEventTypeId)
      .then(({url, filters, eventTypeId}) => {
        dispatch(discoverCatalogSuccess(url, filters, eventTypeId))
      })
      .catch(err => {
        dispatch(discoverCatalogError(err))
      })
  }
}

//
// Helpers
//

function lookupEventTypeId(catalog) {
  return fetch(`${catalog.url}/eventTypeID`, {
    headers: {
      'authorization': catalog.authToken,
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error (code=${response.status})`)
      }
      return response.text()
    })
    .then(eventTypeId => Object.assign(catalog, {eventTypeId}))
}

function lookupFilters(catalog) {
  return fetch(`${catalog.url}/subindex`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error (code=${response.status})`)
      }
      return response.json()
    })
    .then(hash => Object.assign(catalog, {
      filters: Object.keys(hash).map(id => ({id, name: hash[id].name}))
    }))
}

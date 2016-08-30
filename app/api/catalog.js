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

const PATTERN_NAME_PREFIX = /^pzsvc-image-catalog/

export function discover(sessionToken) {
  console.debug('(catalog:discover)')
  const client = new Client(GATEWAY, sessionToken)
  return client.getServices({pattern: PATTERN_NAME_PREFIX.source})
    .then(([catalog]) => {
      if (!catalog) {
        throw new Error('Could not find image catalog service')
      }
      return {
        sessionToken,
        url: catalog.url,
      }
    })
    .then(includeFilters)
    .then(includeEventTypeId)
    .then(catalog => ({
      eventTypeId: catalog.eventTypeId,
      filters:     catalog.filters,
      url:         catalog.url,
    }))
    .catch(err => {
      console.error('(catalog:discover) discovery failed:', err)
      throw err
    })
}

export function search({
  catalogUrl,
  bbox,
  cloudCover,
  dateFrom,
  dateTo,
  filter,
  startIndex = 0,
  count = 100,
}) {
  console.debug('(catalog:search)')
  return fetch(`${catalogUrl}/discover?` + [
    `acquiredDate=${new Date(dateFrom).toISOString()}`,
    `maxAcquiredDate=${new Date(dateTo).toISOString()}`,
    `bbox=${bbox}`,
    `cloudCover=${cloudCover}`,
    `subIndex=${filter || ''}`,
    `count=${count}`,
    `startIndex=${startIndex}`,
  ].join('&'))
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error (code=${response.status})`)
      }
      return response.json()
    })
    .catch(err => {
      console.error('(catalog:search) discovery failed:', err)
      throw err
    })
}


//
// Helpers
//

function includeEventTypeId(catalog) {
  return fetch(`${catalog.url}/eventTypeID`, {
    headers: {
      'Authorization': catalog.sessionToken,
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

function includeFilters(catalog) {
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

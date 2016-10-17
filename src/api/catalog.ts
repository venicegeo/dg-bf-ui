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

import {getClient} from './session'

const PATTERN_NAME_PREFIX = /^pzsvc-image-catalog$/

export interface ServiceDescriptor {
  error?: any
  eventTypeId?: string
  filters?: {id: string, name: string}[]
  url?: string
}

export function discover(): Promise<ServiceDescriptor> {
  console.debug('(catalog:discover)')
  const client = getClient()
  return client.getServices({pattern: PATTERN_NAME_PREFIX.source})
    .then(([catalog]) => {
      if (!catalog) {
        throw new Error('Could not find image catalog service')
      }
      return {
        sessionToken: client.sessionToken,
        url: catalog.url,
      }
    })
    .then(includeEventTypeId)
    .then(catalog => ({
      eventTypeId: catalog.eventTypeId,
      filters:     [],  // HACK -- until we're given the new way to enumerate filters from the catalog...
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
  startIndex,
  count,
}): Promise<beachfront.ImageryCatalogPage> {
  console.debug('(catalog:search)')
  return fetch(`${catalogUrl}/discover?` + [
    `acquiredDate=${new Date(dateFrom).toISOString()}`,
    `maxAcquiredDate=${new Date(dateTo).toISOString()}`,
    `bbox=${bbox}`,
    `cloudCover=${cloudCover}`,
    `count=${count}`,
    `startIndex=${startIndex}`,
  ].join('&'))
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error (code=${response.status})`)
      }
      return response.json()
    })

    // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
    // This can be removed after Redmine #7621 is resolved
    .then((imagery: beachfront.ImageryCatalogPage) => {
      for (const feature of imagery.images.features) {
        feature.properties.link = `${catalogUrl}/image/${feature.id}`
      }
      return imagery
    })
    // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

    .catch(err => {
      console.error('(catalog:search) discovery failed:', err)
      throw err
    })
}

//
// Helpers
//

function includeEventTypeId(catalog) {
  const {gateway, sessionToken} = getClient()
  return fetch(`${catalog.url}/eventTypeID?pzGateway=${encodeURIComponent(gateway)}`, {
    headers: {
      'Authorization': sessionToken,
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

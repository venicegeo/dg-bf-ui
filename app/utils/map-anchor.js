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

import ol from 'openlayers'

export function serialize(bbox) {
  const basemapIndex = 0
  const zoom = 9
  const [lat, long] = ol.extent.getCenter(bbox).map(truncate)
  return `${basemapIndex}:${zoom}:${lat},${long}`
}

export function deserialize(serialized) {
  const chunks = serialized.match(/^#(\d+):(\d+):(-?[0-9.]+),(-?[0-9.]+)$/)
  if (chunks) {
    return {
      basemapIndex: parseInt(chunks[1], 10),
      zoom: parseInt(chunks[2], 10),
      center: ol.proj.fromLonLat([
        parseFloat(chunks[3]),
        parseFloat(chunks[4])
      ])
    }
  }
  return null
}

function truncate(number) {
  return Math.round(number * 1000) / 1000
}

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

export function serializeFromBbox(bbox) {
  return serialize(ol.extent.getCenter(bbox), 1000, 0)
}

export function serialize(coordinate, resolution = 25000, basemapIndex = 0) {
  const [lat, long] = coordinate.map(truncate)
  return `#${basemapIndex}:${Math.ceil(resolution)}:${lat},${long}`
}

export function deserialize(serialized) {
  const chunks = serialized.match(/^#(\d+):(-?[0-9.]+):(-?[0-9.]+),(-?[0-9.]+)$/)
  if (chunks) {
    return {
      basemapIndex: parseInt(chunks[1], 10),
      resolution: parseInt(chunks[2], 10),
      center: ol.proj.fromLonLat([
        truncate(parseFloat(chunks[3])),
        truncate(parseFloat(chunks[4]))
      ])
    }
  }
  return null
}

function truncate(number) {
  return Math.round(number * 1000) / 1000
}

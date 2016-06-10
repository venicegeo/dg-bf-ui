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

const WGS84 = 'EPSG:4326'
const WEB_MERCATOR = 'EPSG:3857'

export function serialize(bbox) {
  return bbox.map(n => Math.round(n * 1000) / 1000).join(',')
}

export function deserialize(serialized) {
  const coordinates = decodeURIComponent(serialized).split(',').map(parseFloat)
  if (coordinates.length === 4) {
    return ol.proj.transformExtent(coordinates, WGS84, WEB_MERCATOR)
  }
  return null
}

export function fromFeature(geojsonFeature) {
  if (!geojsonFeature || !geojsonFeature.geometry) {
    throw new Error('Input must be a GeoJSON Feature')
  }
  const geometry = new ol.format.GeoJSON().readGeometry(geojsonFeature.geometry)
  return ol.proj.transformExtent(geometry.getExtent(), WEB_MERCATOR, WGS84)
}

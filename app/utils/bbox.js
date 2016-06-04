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
  return ol.proj.transformExtent(geometry, WEB_MERCATOR, WGS84)
}

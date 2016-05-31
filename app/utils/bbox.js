import ol from 'openlayers'

export function serialize(bbox) {
  return bbox.map(n => Math.round(n * 1000) / 1000).join(',')
}

export function deserialize(serialized) {
  const coordinates = decodeURIComponent(serialized).split(',').map(parseFloat)
  return ol.proj.transformExtent(coordinates, 'EPSG:4326', 'EPSG:3857')
}

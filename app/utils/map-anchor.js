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

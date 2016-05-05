export const API_NAMESPACE = process.env.API_NAMESPACE

export const TILE_PROVIDERS = [
  {
    url: 'http://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attributions: '&copy; OpenStreetMap &copy; CartoDB',
    maxZoom: 19
  },
  {
    url: 'http://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.jpg',
    attributions: 'Esri, HERE, DeLorme, MapmyIndia, &copy; OpenStreetMap contributors, and the GIS user community',
    tileSize: 256,
    maxZoom: 16
  }
]

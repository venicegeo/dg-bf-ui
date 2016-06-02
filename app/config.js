export const CATALOG = process.env.CATALOG
export const GATEWAY = process.env.GATEWAY

const time = {millisecond: 1, second: 1000, minute: 60000}

export const JOBS_WORKER = {
  INTERVAL: 15 * time.second,
  JOB_TTL:  5 * time.minute
}

export const TILE_PROVIDERS = [
  {
    name: 'Grey (Default)',
    url: 'https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png64?access_token=pk.eyJ1IjoiYmF6aWxlcmJ0IiwiYSI6ImNpbmpwcjlrMzB4cHN0dG0zdDJpMWV6ZjkifQ.7Vywvn-z3L6nfSeI4v-Rdg',
    attributions: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/about/" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 22
  },
  {
    name: 'Dark Grey',
    url: 'https://api.mapbox.com/v4/mapbox.dark/{z}/{x}/{y}.png64?access_token=pk.eyJ1IjoiYmF6aWxlcmJ0IiwiYSI6ImNpbmpwcjlrMzB4cHN0dG0zdDJpMWV6ZjkifQ.7Vywvn-z3L6nfSeI4v-Rdg',
    attributions: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/about/" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 22
  },
  {
    name: 'Aerial',
    url: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png64?access_token=pk.eyJ1IjoiYmF6aWxlcmJ0IiwiYSI6ImNpbmpwcjlrMzB4cHN0dG0zdDJpMWV6ZjkifQ.7Vywvn-z3L6nfSeI4v-Rdg',
    attributions: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/about/" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://www.digitalglobe.com/" target="_blank" rel="noopener">DigitalGlobe</a>',
    maxZoom: 22
  },
  {
    name: 'Road/Terrain',
    url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png64?access_token=pk.eyJ1IjoiYmF6aWxlcmJ0IiwiYSI6ImNpbmpwcjlrMzB4cHN0dG0zdDJpMWV6ZjkifQ.7Vywvn-z3L6nfSeI4v-Rdg',
    attributions: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/about/" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 22
  }
]

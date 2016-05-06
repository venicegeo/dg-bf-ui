export const API_NAMESPACE = process.env.API_NAMESPACE

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

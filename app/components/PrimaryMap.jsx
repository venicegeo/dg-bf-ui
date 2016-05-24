import 'openlayers/dist/ol.css'
import React, {Component} from 'react'
import openlayers from 'openlayers'
import ExportControl from '../utils/openlayers.ExportControl.js'
import SearchControl from '../utils/openlayers.SearchControl.js'
import BasemapSelect from './BasemapSelect.jsx'
import styles from './PrimaryMap.css'
import {TILE_PROVIDERS} from '../config'

const INITIAL_CENTER = [-20, 0]
const MIN_ZOOM = 2.5
const MAX_ZOOM = 22
const DETECTED = 'Detected'
const UNDETECTED = 'Undetected'
const NEW_DETECTION = 'New Detection'

export default class PrimaryMap extends Component {
  static propTypes = {
    datasets: React.PropTypes.array
  }

  constructor() {
    super()
    this._basemaps = []
    this._layers = []
    this.state = {basemapIndex: 0}
    this._export = this._export.bind(this)
  }

  componentDidMount() {
    this._initializeOpenLayers()
    this._renderLayers()
  }

  componentDidUpdate(previousProps) {
    if (this.props.datasets !== previousProps.datasets) {
      this._clearLayers()
      this._renderLayers()
    }
    this._updateBasemap()
  }

  render() {
    const providerNames = TILE_PROVIDERS.map(b => b.name)
    return (
      <main className={styles.root} ref="container">
        <BasemapSelect className={styles.basemapSelect}
                       basemaps={providerNames}
                       changed={basemapIndex => this.setState({basemapIndex})}/>
      </main>
    )
  }

  //
  // Internals
  //

  _initializeOpenLayers() {
    this._basemaps = generateBasemapLayers(TILE_PROVIDERS)
    this._map = new openlayers.Map({
      controls: generateControls(),
      interactions: generateInteractions(),
      layers: this._basemaps,
      target: this.refs.container,
      view: new openlayers.View({
        center: openlayers.proj.fromLonLat(INITIAL_CENTER),
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoom: MIN_ZOOM
      })
    })


    // HACK HACK HACK HACK HACK HACK HACK
    this._map.on('click', event => {
      // const layers = []
      this._map.forEachLayerAtPixel(event.pixel, layer => {
        const job = layer.get('job')
        if (job) {
          console.debug('clicked bbox for:', job)
        }
      })
    })
  }

  _clearLayers() {
    this._layers.forEach(layer => this._map.removeLayer(layer))
  }

  _renderLayers() {
    window.ol = openlayers
    window.map = this._map
    window.primarymap = this

    this.props.datasets.forEach(dataset => {
      const [bbox, label] = generateBBoxLayer(dataset)
      this._layers.push(bbox)
      this._layers.push(label)
      this._map.addLayer(bbox)
      this._map.addLayer(label)
      if (dataset.result) {
        const reader = new openlayers.format.GeoJSON()
        reader
          .readFeatures(dataset.result, {featureProjection: 'EPSG:3857'})
          .forEach(feature => {
            const source = new openlayers.source.Vector({features: [feature]})
            const layer  = new openlayers.layer.Vector({source, style: generateStyles(feature)})
            this._layers.push(layer)
            this._map.addLayer(layer)
          })
      }
    })
  }

  _export() {
    const timestamp = new Date().toISOString().replace(/(\D+|\.\d+)/g, '')
    const element = this.refs.downloadButton
    element.download = `BEACHFRONT_EXPORT_${timestamp}.png`
    this._map.once('postcompose', event => {
      const canvas = event.context.canvas
      element.href = canvas.toDataURL()
    })
    this._map.renderSync()
  }

  _updateBasemap() {
    this._basemaps.forEach((layer, i) => layer.setVisible(i === this.state.basemapIndex))
  }
}

function generateBasemapLayers(providers) {
  return providers.map((provider, index) => {
    const source = new openlayers.source.XYZ(Object.assign({crossOrigin: 'anonymous'}, provider))
    const layer = new openlayers.layer.Tile({source})
    layer.setProperties({name: provider.name, visible: index === 0})
    return layer
  })
}

function generateBBoxLayer(dataset) {
  const LABEL_CENTER_THRESHOLD = 1000
  const extent = openlayers.proj.transformExtent(dataset.job.bbox, 'EPSG:4326', 'EPSG:3857')
  const geometry = openlayers.geom.Polygon.fromExtent(extent)
  let bboxColor
  switch (dataset.job.status) {
    case 'Running':
      bboxColor = 'rgba(255,255,0, .5)'
      break;
    case 'Success':
      bboxColor = 'rgba(0,255,0, .5)'
      break;
    case 'Timed Out':
    case 'Error':
      bboxColor = 'rgba(255,0,0, .5)'
      break;
    default:
      bboxColor = 'red'
  }

  const rectangle = new openlayers.layer.Vector({
    source: new openlayers.source.Vector({
      features: [new openlayers.Feature({geometry})]
    }),
    style(feature, resolution) {
      return new openlayers.style.Style({
        fill: new openlayers.style.Fill({color: bboxColor}),
        stroke: new openlayers.style.Stroke({
          color: 'rgba(0, 0, 0, .2)',
          width: 2
        }),
        text: (resolution < LABEL_CENTER_THRESHOLD) ? new openlayers.style.Text({
          text: dataset.job.name.toUpperCase(),
          font: 'bold 13px Catamaran, Arial, sans-serif'
        }) : undefined
      })
    }
  })

  rectangle.set('job', dataset.job)
  
  const topRight = openlayers.extent.getTopRight(geometry.getExtent())
  const label = new openlayers.layer.Vector({
    source: new openlayers.source.Vector({
      features: [new openlayers.Feature({
        geometry: new openlayers.geom.Point(topRight)
      })]
    }),
    style(feature, resolution) {
      if (resolution < LABEL_CENTER_THRESHOLD) {
        return
      }
      return new openlayers.style.Style({
        text: new openlayers.style.Text({
          text: dataset.job.name.toUpperCase(),
          font: 'bold 13px Catamaran, Arial, sans-serif',
          stroke: new openlayers.style.Stroke({
            width: 4,
            color: 'rgba(255,255,255,.5)'
          }),
          textAlign: 'start',
          textBaseline: 'bottom'
        })
      })
    }
  })

  return [rectangle, label]
}

function generateControls() {
  return openlayers.control.defaults({
    attributionOptions: {collapsible: false}
  }).extend([
    new openlayers.control.ScaleLine({
      minWidth: 250,
      units: 'nautical'
    }),
    new openlayers.control.ZoomSlider(),
    new openlayers.control.MousePosition({
      coordinateFormat: openlayers.coordinate.toStringHDMS,
      projection: 'EPSG:4326'
    }),
    new openlayers.control.FullScreen(),
    new ExportControl(styles.export),
    new SearchControl(styles.search)
  ])
}

function generateInteractions() {
  return openlayers.interaction.defaults().extend([
    new openlayers.interaction.DragRotate({
      condition: openlayers.events.condition.altKeyOnly
    })
  ])
}

function generateStyles(feature) {
  const geometry = feature.getGeometry()
  switch (feature.get('detection')) {
    case DETECTED:
      const [baseline, detection] = geometry.getGeometries()
      return [generateStyleDetectionBaseline(baseline), generateStyleDetection(detection)]
    case UNDETECTED:
      return [generateStyleUndetected()]
    case NEW_DETECTION:
      return [generateStyleNewDetection()]
    default:
      return [generateStyleUnknownDetectionType()]
  }
}

function generateStyleDetectionBaseline(baseline) {
  return new openlayers.style.Style({
    geometry: baseline,
    stroke: new openlayers.style.Stroke({
      color: 'hsla(160, 100%, 30%, .5)',
      width: 2,
      lineDash: [5, 5],
      lineCap: 'miter',
      lineJoin: 'miter'
    })
  })
}

function generateStyleDetection(detection) {
  return new openlayers.style.Style({
    geometry: detection,
    fill: new openlayers.style.Fill({
      color: 'hsla(160, 100%, 30%, .2)'
    }),
    stroke: new openlayers.style.Stroke({
      color: 'hsla(160, 100%, 30%, .75)',
      width: 2
    })
  })
}

function generateStyleNewDetection() {
  return new openlayers.style.Style({
    stroke: new openlayers.style.Stroke({
      width: 2,
      color: 'hsl(205, 100%, 50%)'
    })
  })
}

function generateStyleUndetected() {
  return new openlayers.style.Style({
    fill: new openlayers.style.Fill({
      color: 'hsla(0, 100%, 75%, .2)'
    }),
    stroke: new openlayers.style.Stroke({
      color: 'red',
      width: 2,
      lineDash: [5, 5],
      lineCap: 'miter',
      lineJoin: 'miter'
    })
  })
}

function generateStyleUnknownDetectionType() {
  return new openlayers.style.Style({
    stroke: new openlayers.style.Stroke({
      color: 'magenta',
      width: 2
    })
  })
}

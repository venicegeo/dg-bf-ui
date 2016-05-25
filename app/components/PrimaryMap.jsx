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
const FOCUS_RESOLUTION = 1000

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
      this._clearOverlays()
      this._renderLayers()
      this._renderOverlays()
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
      this._map.forEachLayerAtPixel(event.pixel, layer => {
        const job = layer.get('job')
        if (job) {
          console.debug('clicked bbox for:', job)
        }
      })
    })
    // HACK HACK HACK HACK HACK HACK HACK


  }

  _addLayer(layer) {
    this._layers.push(layer)
    this._map.addLayer(layer)
  }

  _clearLayers() {
    this._layers.forEach(layer => this._map.removeLayer(layer))
  }

  _clearOverlays() {
    this._map.getOverlays().clear()
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

  _renderLayers() {
    this.props.datasets.forEach(dataset => {
      this._addLayer(generateJobFrameLayer(dataset))
      this._addLayer(generateLabelLayer(dataset))
      generateResultLayers(dataset).forEach(layer => this._addLayer(layer))
    })
  }

  _renderOverlays() {
    this.props.datasets.forEach(dataset => {
      if (dataset.progress) {
        const progressBar = generateProgressBarOverlay(dataset)
        if (progressBar) {
          this._map.addOverlay(progressBar)
        }
      }
    })
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

function generateJobFrameLayer(dataset) {
  const labelText = dataset.job.name.toUpperCase()
  let fillColor = 'red'
  switch (dataset.job.status) {
  case 'Running':
    fillColor = 'rgba(255,255,0, .5)'
    break;
  case 'Success':
    fillColor = 'rgba(0,255,0, .5)'
    break;
  case 'Timed Out':
  case 'Error':
    fillColor = 'rgba(255,0,0, .5)'
    break;
  }

  const rectangle = new openlayers.layer.Vector({
    source: new openlayers.source.Vector({
      features: [
        new openlayers.Feature({
          geometry: openlayers.geom.Polygon.fromExtent(transformExtent(dataset.job.bbox))
        })
      ]
    }),
    style(_, resolution) {
      return new openlayers.style.Style({
        fill: new openlayers.style.Fill({
          color: fillColor
        }),
        stroke: new openlayers.style.Stroke({
          color: 'rgba(0, 0, 0, .5)'
        }),
        text: (resolution < FOCUS_RESOLUTION) ?
          new openlayers.style.Text({
            font: 'bold 16px Catamaran, Arial, sans-serif',
            text: labelText
          }) :
          undefined
      })
    }
  })

  // HACK HACK HACK HACK HACK
  rectangle.set('job', dataset.job)
  // HACK HACK HACK HACK HACK

  return rectangle
}

function generateLabelLayer(dataset) {
  const topRight = openlayers.extent.getTopRight(transformExtent(dataset.job.bbox))
  const text = dataset.job.name.toUpperCase()
  return new openlayers.layer.Vector({
    minResolution: FOCUS_RESOLUTION,
    source: new openlayers.source.Vector({
      features: [
        new openlayers.Feature({
          geometry: new openlayers.geom.Point(topRight)
        })
      ]
    }),
    style: new openlayers.style.Style({
      text: new openlayers.style.Text({
        text,
        font: 'bold 13px Catamaran, Arial, sans-serif',
        stroke: new openlayers.style.Stroke({
          width: 2,
          color: 'rgba(255,255,255,.5)'
        }),
        textAlign: 'start',
        textBaseline: 'bottom'
      })
    })
  })
}

function generateProgressBarOverlay(dataset) {
  if (dataset.progress && dataset.progress.loaded < dataset.progress.total) {
    const element = document.createElement('div')
    const percentage = ((dataset.progress.loaded / dataset.progress.total) || 0) * 100
    const bar = document.createElement('div')
    element.setAttribute('style', 'border: 1px solid white; width: 100px; transform: translateY(200%); border-radius: 2px; overflow: hidden;')
    bar.setAttribute('style', `width: ${percentage}%; height: 6px; background-color: white;`)
    element.appendChild(bar)
    return new openlayers.Overlay({
      element,
      position: openlayers.extent.getBottomLeft(transformExtent(dataset.job.bbox)),
      positioning: 'bottom-left'
    })
  }
}

function generateResultLayers(dataset) {
  if (dataset.result) {
    const reader = new openlayers.format.GeoJSON()
    reader
      .readFeatures(dataset.result, {featureProjection: 'EPSG:3857'})
      .map(feature => new openlayers.layer.Vector({
        source: new openlayers.source.Vector({
          features: [feature]
        }),
        style: generateStyles(feature)
      }))
  }
  return []
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

function transformExtent(extent) {
  return openlayers.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857')
}

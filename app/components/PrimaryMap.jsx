import 'openlayers/dist/ol.css'
import React, {Component} from 'react'
import ol from 'openlayers'
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
const RESOLUTION_CLOSE = 1000

const JOB_ID = 'jobId'
const TYPE = 'type'
const TYPE_FRAME = 'frame'
const TYPE_LABEL = 'label'
const TYPE_PROGRESS = 'progress_bar'
const TYPE_FEATURE = 'feature'

export default class PrimaryMap extends Component {
  static propTypes = {
    datasets: React.PropTypes.array
  }

  constructor() {
    super()
    this._basemaps = []
    this.state = {basemapIndex: 0}
    this._export = this._export.bind(this)
  }

  componentDidMount() {
    this._initializeOpenLayers()
    this._redrawLayersAndOverlays()
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.props.datasets !== previousProps.datasets) {
      this._redrawLayersAndOverlays()
    }
    if (this.state.basemapIndex !== previousState.basemapIndex) {
      this._updateBasemap()
    }
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
    this._map = new ol.Map({
      controls: generateControls(),
      interactions: generateInteractions(),
      layers: this._basemaps,
      target: this.refs.container,
      view: new ol.View({
        center: ol.proj.fromLonLat(INITIAL_CENTER),
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

  _redrawLayersAndOverlays() {
    const {datasets} = this.props
    const exists = {}
    datasets.forEach(dataset => exists[dataset.job.id] = true)

    const skipResults = {}

    // Clear
    this._map.getLayers().getArray().slice().forEach(layer => {
      if (layer instanceof ol.layer.Tile) {
        return
      }
      const id = layer.get(JOB_ID)
      const type = layer.get(TYPE)
      if (exists[id] && type === TYPE_FEATURE) {
        skipResults[id] = true
        return
      }
      this._map.removeLayer(layer)
    })
    this._map.getOverlays().clear()

    // Draw
    datasets.forEach(dataset => {
      this._map.addLayer(generateJobFrameLayer(dataset))
      this._map.addLayer(generateLabelLayer(dataset))
      if (!skipResults[dataset.job.id]) {
        generateResultLayers(dataset).forEach(l => this._map.addLayer(l))
      }
      const progress = generateProgressBarOverlay(dataset)
      if (progress) {
        this._map.addOverlay(progress)
      }
    })
  }

  _updateBasemap() {
    this._basemaps.slice(1).forEach((layer, i) => layer.setVisible(i + 1 === this.state.basemapIndex))
  }
}

function generateBasemapLayers(providers) {
  return providers.map((provider, index) => {
    const source = new ol.source.XYZ(Object.assign({crossOrigin: 'anonymous'}, provider))
    const layer = new ol.layer.Tile({source})
    layer.setProperties({name: provider.name, visible: index === 0})
    return layer
  })
}

function generateControls() {
  return ol.control.defaults({
    attributionOptions: {collapsible: false}
  }).extend([
    new ol.control.ScaleLine({
      minWidth: 250,
      units: 'nautical'
    }),
    new ol.control.ZoomSlider(),
    new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.toStringHDMS,
      projection: 'EPSG:4326'
    }),
    new ol.control.FullScreen(),
    new ExportControl(styles.export),
    new SearchControl(styles.search)
  ])
}

function generateInteractions() {
  return ol.interaction.defaults().extend([
    new ol.interaction.DragRotate({
      condition: ol.events.condition.altKeyOnly
    })
  ])
}

function generateJobFrameLayer(dataset) {
  const labelText = `${dataset.job.name.toUpperCase()} (${dataset.job.status})`
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

  const layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [
        new ol.Feature({
          geometry: ol.geom.Polygon.fromExtent(transformExtent(dataset.job.bbox))
        })
      ]
    }),
    style(_, resolution) {
      const zoomedOut = resolution > RESOLUTION_CLOSE
      if (zoomedOut) {
        return new ol.style.Style({
          fill: new ol.style.Fill({
            color: fillColor
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, .5)'
          })
        })
      }
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, .2)',
          lineDash: [10, 10]
        }),
        text: new ol.style.Text({
          fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, .2)'
          }),
          font: 'bold 18px Catamaran, Arial, sans-serif',
          text: labelText
        })
      })
    }
  })

  layer.set(JOB_ID, dataset.job.id)
  layer.set(TYPE, TYPE_FRAME)

  return layer
}

function generateLabelLayer(dataset) {
  const topRight = ol.extent.getTopRight(transformExtent(dataset.job.bbox))
  const text = dataset.job.name.toUpperCase() + ` (${dataset.job.status})`
  const layer = new ol.layer.Vector({
    minResolution: RESOLUTION_CLOSE,
    source: new ol.source.Vector({
      features: [
        new ol.Feature({
          geometry: new ol.geom.Point(topRight)
        })
      ]
    }),
    style: new ol.style.Style({
      text: new ol.style.Text({
        text,
        font: 'bold 13px Catamaran, Arial, sans-serif',
        stroke: new ol.style.Stroke({
          width: 2,
          color: 'rgba(255,255,255,.5)'
        }),
        textAlign: 'start',
        textBaseline: 'bottom'
      })
    })
  })

  layer.set(JOB_ID, dataset.job.id)
  layer.set(TYPE, TYPE_LABEL)

  return layer
}

function generateProgressBarOverlay(dataset) {
  if (dataset.progress && dataset.progress.loaded < dataset.progress.total) {
    const element = document.createElement('div')
    element.classList.add(styles.progress)

    const percentage = Math.floor(((dataset.progress.loaded / dataset.progress.total) || 0) * 100)
    const puck = document.createElement('div')
    puck.classList.add(styles.progressPuck)
    puck.setAttribute('style', `width: ${percentage}%;`)
    element.appendChild(puck)

    const progress = new ol.Overlay({
      element,
      position: ol.extent.getBottomLeft(transformExtent(dataset.job.bbox)),
      positioning: 'bottom-left'
    })

    progress.set(JOB_ID, dataset.job.id)
    progress.set(TYPE, TYPE_PROGRESS)

    return progress
  }
}

function generateResultLayers(dataset) {
  if (dataset.result) {
    const reader = new ol.format.GeoJSON()
    return reader
      .readFeatures(dataset.result, {featureProjection: 'EPSG:3857'})
      .map(feature => {
        const layer = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [feature]
          }),
          style: generateStyles(feature)
        })

        layer.set(JOB_ID, dataset.job.id)
        layer.set(TYPE, TYPE_FEATURE)

        return layer
      })
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
  return new ol.style.Style({
    geometry: baseline,
    stroke: new ol.style.Stroke({
      color: 'hsla(160, 100%, 30%, .5)',
      width: 2,
      lineDash: [5, 5],
      lineCap: 'miter',
      lineJoin: 'miter'
    })
  })
}

function generateStyleDetection(detection) {
  return new ol.style.Style({
    geometry: detection,
    fill: new ol.style.Fill({
      color: 'hsla(160, 100%, 30%, .2)'
    }),
    stroke: new ol.style.Stroke({
      color: 'hsla(160, 100%, 30%, .75)',
      width: 2
    })
  })
}

function generateStyleNewDetection() {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      width: 2,
      color: 'hsl(205, 100%, 50%)'
    })
  })
}

function generateStyleUndetected() {
  return new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'hsla(0, 100%, 75%, .2)'
    }),
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2,
      lineDash: [5, 5],
      lineCap: 'miter',
      lineJoin: 'miter'
    })
  })
}

function generateStyleUnknownDetectionType() {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'magenta',
      width: 2
    })
  })
}

function transformExtent(extent) {
  return ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857')
}

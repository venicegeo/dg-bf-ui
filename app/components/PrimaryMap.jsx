import 'openlayers/dist/ol.css'
import React, {Component} from 'react'
import ol from 'openlayers'
import ExportControl from '../utils/openlayers.ExportControl.js'
import SearchControl from '../utils/openlayers.SearchControl.js'
import BasemapSelect from './BasemapSelect.jsx'
import {debounce} from '../utils/debounce'
import {deserialize} from '../utils/map-anchor'
import {TILE_PROVIDERS} from '../config'
import styles from './PrimaryMap.css'

const INITIAL_CENTER = [-20, 0]
const MIN_ZOOM = 2.5
const MAX_ZOOM = 22
const DETECTED = 'Detected'
const UNDETECTED = 'Undetected'
const NEW_DETECTION = 'New Detection'
const RESOLUTION_CLOSE = 1000

const JOB_ID = 'jobId'
const TYPE = 'type'
const TYPE_DRAW = 'draw'
const TYPE_FEATURE = 'feature'
const TYPE_FRAME = 'frame'
const TYPE_LABEL = 'label'
const TYPE_PROGRESS = 'progress_bar'

export const MODE_DRAW_BBOX = 'MODE_DRAW_BBOX'
export const MODE_NORMAL = 'MODE_NORMAL'

export default class PrimaryMap extends Component {
  static propTypes = {
    anchor: React.PropTypes.string,
    bboxChanged: React.PropTypes.func,
    datasets: React.PropTypes.array,
    mode: React.PropTypes.string
  }

  constructor() {
    super()
    this.state = {basemapIndex: 0}
    this._recenter = debounce(this._recenter.bind(this))
    this._handleDrawStart = this._handleDrawStart.bind(this)
    this._handleDrawEnd = this._handleDrawEnd.bind(this)
    this._handleMapClick = this._handleMapClick.bind(this)
  }

  componentDidMount() {
    this._initializeOpenLayers()
    this._redrawLayersAndOverlays()
    this._recenter(this.props.anchor)
    if (this.props.mode === MODE_DRAW_BBOX) {
      this._activateDrawInteraction()
    }
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.props.datasets !== previousProps.datasets) {
      this._redrawLayersAndOverlays()
    }
    if (this.state.basemapIndex !== previousState.basemapIndex) {
      this._updateBasemap()
    }
    if (this.props.anchor && this.props.anchor !== previousProps.anchor) {
      this._recenter(this.props.anchor)
    }
    if (this.props.mode === MODE_DRAW_BBOX) {
      this._activateDrawInteraction()
    } else {
      this._deactivateDrawInteraction()
    }
  }

  render() {
    const basemapNames = TILE_PROVIDERS.map(b => b.name)
    return (
      <main className={styles.root} ref="container">
        <BasemapSelect className={styles.basemapSelect}
                       basemaps={basemapNames}
                       changed={basemapIndex => this.setState({basemapIndex})}/>
      </main>
    )
  }

  //
  // Internals
  //

  _activateDrawInteraction() {
    this._getDrawInteraction().setActive(true)
  }

  _clearDraw() {
    this._getDrawLayer().getSource().clear()
  }

  _deactivateDrawInteraction() {
    this._clearDraw()
    this._getDrawInteraction().setActive(false)
  }

  _getBasemapLayers() {
    return this._map.getLayers().getArray().slice(0, TILE_PROVIDERS.length)
  }

  _getDrawInteraction() {
    return this._map.getInteractions().getArray().find(i => i.get(TYPE) === TYPE_DRAW)
  }

  _getLayers() {
    const offset = TILE_PROVIDERS.length + 1  // Basemaps + draw layer
    return this._map.getLayers().getArray().slice(offset)
  }

  _getDrawLayer() {
    return this._map.getLayers().item(TILE_PROVIDERS.length)
  }

  _initializeOpenLayers() {
    const basemapLayers = generateBasemapLayers(TILE_PROVIDERS)
    const drawLayer = generateDrawLayer()
    const drawInteraction = generateDrawInteraction(drawLayer)

    this._map = new ol.Map({
      controls: generateControls(),
      interactions: generateInteractions().extend([drawInteraction]),
      layers: [...basemapLayers, drawLayer],
      target: this.refs.container,
      view: new ol.View({
        center: ol.proj.fromLonLat(INITIAL_CENTER),
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoom: MIN_ZOOM
      })
    })

    // Event handlers
    this._map.on('click', this._handleMapClick)
    drawInteraction.on('drawstart', this._handleDrawStart)
    drawInteraction.on('drawend', this._handleDrawEnd)
  }

  _recenter(anchor) {
    const deserialized = deserialize(anchor)
    if (deserialized) {
      const {basemapIndex, zoom, center} = deserialized
      this.setState({basemapIndex})
      const view = this._map.getView()
      view.setCenter(center)
      view.setZoom(zoom)
    }
  }

  _redrawLayersAndOverlays() {
    const {datasets} = this.props
    const exists = {}
    datasets.forEach(dataset => exists[dataset.job.id] = true)

    const skipResults = {}

    // Clear
    this._getLayers().forEach(layer => {
      if (layer instanceof ol.layer.Tile) {
        return
      }
      const id = layer.get(JOB_ID)
      const type = layer.get(TYPE)
      if (exists[id] && type === TYPE_FEATURE) {
        skipResults[id] = true
        return
      }
      if (type === TYPE_DRAW) {
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
    this._getBasemapLayers().forEach((layer, i) => layer.setVisible(i === this.state.basemapIndex))
  }

  //
  // Events
  //

  _handleMapClick(event) {
    this._map.forEachLayerAtPixel(event.pixel, layer => {
      const jobId = layer.get('jobId')
      if (jobId) {
        console.debug('clicked bbox for:', jobId)
      }
    })
  }

  _handleDrawEnd(event) {
    const extent = event.feature.getGeometry().getExtent()
    const bbox = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
    this.props.bboxChanged(bbox)
  }

  _handleDrawStart() {
    this._clearDraw()
    this.props.bboxChanged(null)
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

function generateDrawLayer() {
  const layer = new ol.layer.Vector({
    source: new ol.source.Vector({wrapX: false}),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'hsla(202, 70%, 50%, .35)'
      }),
      stroke: new ol.style.Stroke({
        color: 'hsla(202, 70%, 50%, .7)',
        width: 1,
        lineDash: [5, 5]
      })
    })
  })
  layer.set(TYPE, TYPE_DRAW)
  return layer
}

function generateDrawInteraction(drawLayer) {
  const draw = new ol.interaction.Draw({
    source: drawLayer.getSource(),
    maxPoints: 2,
    type: 'LineString',
    geometryFunction(coordinates, geometry) {
      geometry = geometry || new ol.geom.Polygon(null)
      const [[x1, y1], [x2, y2]] = coordinates
      geometry.setCoordinates([[[x1, y1], [x1, y2], [x2, y2], [x2, y1], [x1, y1]]])
      return geometry
    },
    style: new ol.style.Style({
      image: new ol.style.RegularShape({
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 1
        }),
        points: 4,
        radius: 15,
        radius2: 0,
        angle: 0
      }),
      fill: new ol.style.Fill({
        color: 'hsla(202, 70%, 50%, .6)'
      }),
      stroke: new ol.style.Stroke({
        color: 'hsl(202, 70%, 50%)',
        width: 1,
        lineDash: [5, 5]
      })
    })
  })
  draw.set(TYPE, TYPE_DRAW)
  draw.setActive(false)
  return draw
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
    break
  case 'Success':
    fillColor = 'rgba(0,255,0, .5)'
    break
  case 'Timed Out':
  case 'Error':
    fillColor = 'rgba(255,0,0, .5)'
    break
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

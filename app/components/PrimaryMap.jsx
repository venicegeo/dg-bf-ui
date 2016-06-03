import 'openlayers/dist/ol.css'
import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import ol from 'openlayers'
import ExportControl from '../utils/openlayers.ExportControl.js'
import SearchControl from '../utils/openlayers.SearchControl.js'
import BasemapSelect from './BasemapSelect.jsx'
import ImageDetails from './ImageDetails.jsx'
import {debounce} from '../utils/debounce'
import * as anchorUtil from '../utils/map-anchor'
import * as bboxUtil from '../utils/bbox'
import {TILE_PROVIDERS} from '../config'
import styles from './PrimaryMap.css'

const INITIAL_CENTER = [-20, 0]
const MIN_ZOOM = 2.5
const MAX_ZOOM = 22
const RESOLUTION_CLOSE = 1000

const DISPOSITION_DETECTED = 'Detected'
const DISPOSITION_UNDETECTED = 'Undetected'
const DISPOSITION_NEW_DETECTION = 'New Detection'
const JOB_ID = 'JOB_ID'
const JOB_NAME = 'JOB_NAME'
const JOB_STATUS = 'JOB_STATUS'
const STATUS_RUNNING = 'Running'
const STATUS_SUCCESS = 'Success'
const STATUS_TIMED_OUT = 'Timed Out'
const STATUS_ERROR = 'Error'
export const MODE_DRAW_BBOX = 'MODE_DRAW_BBOX'
export const MODE_NORMAL = 'MODE_NORMAL'
export const MODE_SELECT_IMAGERY = 'MODE_SELECT_IMAGERY'

export default class PrimaryMap extends Component {
  static propTypes = {
    anchor: React.PropTypes.string,
    bbox: React.PropTypes.string,
    datasets: React.PropTypes.array,
    imagery: React.PropTypes.object,
    mode: React.PropTypes.string,
    onBoundingBoxChange: React.PropTypes.func,
    onImageSelect: React.PropTypes.func
  }

  constructor() {
    super()
    this.state = {basemapIndex: 0}
    this._recenter = debounce(this._recenter.bind(this))
    this._renderSearchBbox = debounce(this._renderSearchBbox.bind(this))
    this._handleDrawStart = this._handleDrawStart.bind(this)
    this._handleDrawEnd = this._handleDrawEnd.bind(this)
    this._handleSelect = this._handleSelect.bind(this)
  }

  componentDidMount() {
    this._initializeOpenLayers()
    this._renderDetections()
    this._renderFrames()
    this._renderImagery()
    this._recenter(this.props.anchor)
    if (this.props.bbox) {
      this._renderSearchBbox()
    }
    if (this.props.mode === MODE_DRAW_BBOX) {
      this._activateDrawInteraction()
    }
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    if (process.env.NODE_ENV === 'development') {
      window.ol = ol
      window.map = this._map
    }
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  }

  componentDidUpdate(previousProps, previousState) {
    if (this.props.datasets !== previousProps.datasets) {
      this._renderDetections()
      this._renderFrames()
      this._renderImagery()
      this._renderProgressBars()
    }
    if (this.props.bbox !== previousProps.bbox) {
      this._renderSearchBbox()
    }
    if (this.state.basemapIndex !== previousState.basemapIndex) {
      this._updateBasemap()
    }
    if (this.props.anchor && this.props.anchor !== previousProps.anchor) {
      this._recenter(this.props.anchor)
    }
    if (this.props.mode !== previousProps.mode) {
      this._updateInteractions()
    }
  }

  render() {
    const basemapNames = TILE_PROVIDERS.map(b => b.name)
    return (
      <main className={styles.root} ref="container">
        <BasemapSelect className={styles.basemapSelect}
                       basemaps={basemapNames}
                       changed={basemapIndex => this.setState({basemapIndex})}/>
        <ImageDetails ref="imageryDetails" feature={this.state.selectedImageFeature}/>
      </main>
    )
  }

  //
  // Internals
  //

  _activateDrawInteraction() {
    this._drawInteraction.setActive(true)
  }

  _activateSelectInteraction() {
    this._selectInteraction.setActive(true)
  }

  _clearDraw() {
    this._drawLayer.getSource().clear()
  }

  _clearSelection() {
    this._selectInteraction.getFeatures().clear()
  }

  _deactivateDrawInteraction() {
    this._clearDraw()
    this._drawInteraction.setActive(false)
  }

  _deactivateSelectInteraction() {
    this._clearSelection()
    this._selectInteraction.setActive(false)
  }

  _initializeOpenLayers() {
    this._basemapLayers = generateBasemapLayers(TILE_PROVIDERS)
    this._detectionsLayer = generateDetectionsLayer()
    this._drawLayer = generateDrawLayer()
    this._frameLayer = generateFrameLayer()
    this._imageryLayer = generateImageryLayer()

    this._drawInteraction = generateDrawInteraction(this._drawLayer)
    this._drawInteraction.on('drawstart', this._handleDrawStart)
    this._drawInteraction.on('drawend', this._handleDrawEnd)

    this._selectInteraction = generateSelectInteraction(this._imageryLayer)
    this._selectInteraction.on('select', this._handleSelect)

    this._progressBars = {}
    this._imageDetailsOverlay = generateImageryDetailsOverlay(this.refs.imageryDetails)

    this._map = new ol.Map({
      controls: generateControls(),
      interactions: generateBaseInteractions().extend([this._drawInteraction, this._selectInteraction]),
      layers: [
        // Order matters here
        ...this._basemapLayers,
        this._frameLayer,
        this._drawLayer,
        this._imageryLayer,
        this._detectionsLayer
      ],
      overlays: [
        this._imageDetailsOverlay
      ],
      target: this.refs.container,
      view: new ol.View({
        center: ol.proj.fromLonLat(INITIAL_CENTER),
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoom: MIN_ZOOM
      })
    })
  }

  _recenter(anchor) {
    const deserialized = anchorUtil.deserialize(anchor)
    if (deserialized) {
      const {basemapIndex, zoom, center} = deserialized
      this.setState({basemapIndex})
      const view = this._map.getView()
      view.setCenter(center)
      view.setZoom(zoom)
    }
  }

  _renderDetections() {
    const {datasets} = this.props
    const incomingJobs = {}
    datasets.forEach(dataset => incomingJobs[dataset.job.id] = true)
    const source = this._detectionsLayer.getSource()
    const previous = {}

    // Removals (no updates)
    source.getFeatures().slice().forEach(feature => {
      const jobId = feature.get(JOB_ID)
      previous[jobId] = true
      if (!incomingJobs[jobId]) {
        source.removeFeature(feature)
      }
    })

    // Additions
    const reader = new ol.format.GeoJSON()
    datasets.filter(d => d.geojson && !previous[d.job.id]).forEach(dataset => {
      const features = reader.readFeatures(dataset.geojson, {featureProjection: 'EPSG:3857'})
      features.forEach(f => f.setProperties({
        [JOB_ID]: dataset.job.id,
        [JOB_NAME]: dataset.job.name,
        [JOB_STATUS]: dataset.job.status
      }))
      source.addFeatures(features)
    })
  }

  _renderFrames() {
    const {datasets} = this.props
    this._frameLayer.getSource().clear()
    this._frameLayer.getSource().addFeatures(datasets.map(dataset => {
      const feature = new ol.Feature({
        geometry: ol.geom.Polygon.fromExtent(ol.proj.transformExtent(dataset.job.bbox, 'EPSG:4326', 'EPSG:3857'))
      })
      feature.setProperties({
        [JOB_ID]: dataset.job.id,
        [JOB_NAME]: dataset.job.name,
        [JOB_STATUS]: dataset.job.status
      })
      return feature
    }))
  }

  _renderImagery() {
    const {imagery} = this.props
    const reader = new ol.format.GeoJSON()
    this._imageryLayer.getSource().clear()
    if (imagery) {
      const features = reader.readFeatures(imagery.images, {featureProjection: 'EPSG:3857'})
      // TODO -- set attributions
      this._imageryLayer.getSource().addFeatures(features)
    }
  }

  _renderProgressBars() {
    const {datasets} = this.props
    const indexes = {}
    datasets.forEach((dataset, index) => indexes[dataset.job.id] = index)

    // Updates & Removals
    const rendered = {}
    Object.keys(this._progressBars).forEach(id => {
      const overlay = this._progressBars[id]
      rendered[id] = true
      const dataset = datasets[indexes[id]]
      // Update
      if (dataset && dataset.progress && dataset.progress.loaded < dataset.progress.total) {
        const percentage = Math.floor(((dataset.progress.loaded / dataset.progress.total) || 0) * 100)
        overlay.getElement().firstChild.setAttribute('style', `width: ${percentage}%`)
        return
      }
      // Remove
      this._map.removeOverlay(overlay)
      delete this._progressBars[id]
    })

    // Additions
    datasets.filter(d => d.progress && d.progress.loaded < d.progress.total && !rendered[d.job.id]).forEach(dataset => {
      const overlay = generateProgressBarOverlay(dataset)
      this._progressBars[overlay.getId()] = overlay
      this._map.addOverlay(overlay)
    })
  }

  _renderSearchBbox() {
    this._clearDraw()
    const deserialized = bboxUtil.deserialize(this.props.bbox)
    if (!deserialized) {
      return
    }
    const feature = new ol.Feature({
      geometry: ol.geom.Polygon.fromExtent(deserialized)
    })
    this._drawLayer.getSource().addFeature(feature)
  }

  _updateBasemap() {
    this._basemapLayers.forEach((layer, i) => layer.setVisible(i === this.state.basemapIndex))
  }

  _updateInteractions() {
    switch (this.props.mode) {
    case MODE_SELECT_IMAGERY:
      this._deactivateDrawInteraction()
      this._activateSelectInteraction()
      break
    case MODE_DRAW_BBOX:
      this._deactivateSelectInteraction()
      this._activateDrawInteraction()
      break
    case MODE_NORMAL:
      this._deactivateDrawInteraction()
      this._deactivateSelectInteraction()
      break
    default:
      console.warn('wat mode=%s', this.props.mode)
      break
    }
  }

  //
  // Events
  //

  _handleDrawEnd(event) {
    const extent = event.feature.getGeometry().getExtent()
    const bbox = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
    this.props.onBoundingBoxChange(bboxUtil.serialize(bbox))
  }

  _handleDrawStart() {
    this._clearDraw()
    this.props.onBoundingBoxChange(null)
  }

  _handleSelect(event) {
    if (this.props.mode === MODE_SELECT_IMAGERY) {
      const feature = event.target.getFeatures().item(0)
      this.props.onImageSelect(feature ? feature.getId() : null)
      if (feature) {
        this.setState({selectedImageFeature: feature})
        this._imageDetailsOverlay.setPosition(ol.extent.getTopRight(feature.getGeometry().getExtent()))
      } else {
        this.setState({selectedImageFeature: null})
        this._imageDetailsOverlay.setPosition(undefined)
      }
    }
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

function generateBaseInteractions() {
  return ol.interaction.defaults().extend([
    new ol.interaction.DragRotate({
      condition: ol.events.condition.altKeyOnly
    })
  ])
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

function generateDetectionsLayer() {
  return new ol.layer.Vector({
    source: new ol.source.Vector(),
    style(feature) {
      const geometry = feature.getGeometry()
      switch (feature.get('detection')) {
      case DISPOSITION_DETECTED:
        const [baseline, detection] = geometry.getGeometries()
        return [generateStyleDetectionBaseline(baseline), generateStyleDetection(detection)]
      case DISPOSITION_UNDETECTED:
        return generateStyleUndetected()
      case DISPOSITION_NEW_DETECTION:
        return generateStyleNewDetection()
      default:
        return generateStyleUnknownDetectionType()
      }
    }
  })
}

function generateDrawLayer() {
  return new ol.layer.Vector({
    source: new ol.source.Vector({
      wrapX: false
    }),
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
  draw.setActive(false)
  return draw
}

function generateFrameLayer() {
  function _getFillColor(status) {
    switch (status) {
    case STATUS_RUNNING: return 'rgba(255,255,0, .5)'
    case STATUS_SUCCESS: return 'rgba(0,255,0, .5)'
    case STATUS_TIMED_OUT:
    case STATUS_ERROR: return 'rgba(255,0,0, .5)'
    default: return 'magenta'
    }
  }
  return new ol.layer.Vector({
    source: new ol.source.Vector(),
    style(feature, resolution) {
      // FIXME -- convert labels to overlays
      const labelText = `${feature.get(JOB_NAME).toUpperCase()} (${feature.get(JOB_STATUS)})`
      const zoomedOut = resolution > RESOLUTION_CLOSE
      if (zoomedOut) {
        return new ol.style.Style({
          text: new ol.style.Text({
            fill: new ol.style.Fill({
              color: 'black'
            }),
            font: 'bold 18px Catamaran, Arial, sans-serif',
            text: labelText
          }),
          fill: new ol.style.Fill({
            color: _getFillColor(feature.get(JOB_STATUS))
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, .5)'
          })
        })
      }
      return new ol.style.Style({
        text: new ol.style.Text({
          fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, .4)'
          }),
          font: 'bold 13px Catamaran, Arial, sans-serif',
          text: labelText
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, .2)',
          lineDash: [10, 10]
        })
      })
    }
  })
}

function generateImageryLayer() {
  return new ol.layer.Vector({
    source: new ol.source.Vector(),
    style() {
      return new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0,0,0, .15)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0,0,0, .5)',
          width: 1
        })
      })
    }
  })
}

function generateImageryDetailsOverlay(componentRef) {
  return new ol.Overlay({
    autoPan: true,
    element: findDOMNode(componentRef),
    id: 'imageryDetails',
    positioning: 'bottom-right'
  })
}

function generateProgressBarOverlay(dataset) {
  const element = document.createElement('div')
  element.classList.add(styles.progress)

  const percentage = Math.floor(((dataset.progress.loaded / dataset.progress.total) || 0) * 100)
  const puck = document.createElement('div')
  puck.classList.add(styles.progressPuck)
  puck.setAttribute('style', `width: ${percentage}%;`)
  element.appendChild(puck)

  return new ol.Overlay({
    id: dataset.job.id,
    element,
    position: ol.extent.getBottomLeft(ol.proj.transformExtent(dataset.job.bbox, 'EPSG:4326', 'EPSG:3857')),
    positioning: 'bottom-left'
  })
}

function generateSelectInteraction(...layers) {
  return new ol.interaction.Select({
    layers,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'red'
      })
    })
  })
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

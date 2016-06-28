/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import 'openlayers/dist/ol.css'
import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import ol from 'openlayers'
import ExportControl from '../utils/openlayers.ExportControl.js'
import SearchControl from '../utils/openlayers.SearchControl.js'
import BasemapSelect from './BasemapSelect'
import FeatureDetails from './FeatureDetails'
import ImagerySearchResults from './ImagerySearchResults'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import * as anchorUtil from '../utils/map-anchor'
import * as bboxUtil from '../utils/bbox'
import {TILE_PROVIDERS} from '../config'
import styles from './PrimaryMap.css'
import {
  KEY_NAME,
  KEY_STATUS,
  KEY_TYPE,
  STATUS_ERROR,
  STATUS_RUNNING,
  STATUS_SUCCESS,
  STATUS_TIMED_OUT,
  TYPE_SCENE,
} from '../constants'

const INITIAL_CENTER = [110, 0]
const MIN_ZOOM = 2.5
const MAX_ZOOM = 22
const RESOLUTION_CLOSE = 1000
const DISPOSITION_DETECTED = 'Detected'
const DISPOSITION_UNDETECTED = 'Undetected'
const DISPOSITION_NEW_DETECTION = 'New Detection'
const KEY_OWNER_ID = 'OWNER_ID'
const KEY_DETECTION = 'detection'
export const MODE_DRAW_BBOX = 'MODE_DRAW_BBOX'
export const MODE_NORMAL = 'MODE_NORMAL'
export const MODE_SELECT_IMAGERY = 'MODE_SELECT_IMAGERY'

export default class PrimaryMap extends Component {
  static propTypes = {
    anchor:              React.PropTypes.string,
    bbox:                React.PropTypes.arrayOf(React.PropTypes.number),
    datasets:            React.PropTypes.arrayOf(React.PropTypes.shape({
      job:      React.PropTypes.shape({
        geometry:   React.PropTypes.object.isRequired,
        id:         React.PropTypes.string.isRequired,
        properties: React.PropTypes.object.isRequired,
        type:       React.PropTypes.string.isRequired,
      }).isRequired,
      progress: React.PropTypes.shape({
        loaded: React.PropTypes.number,
        total:  React.PropTypes.number,
      }),
    })).isRequired,
    imagery:             React.PropTypes.shape({
      count:      React.PropTypes.number.isRequired,
      startIndex: React.PropTypes.number.isRequired,
      images:     React.PropTypes.object.isRequired
    }),
    isSearching:         React.PropTypes.bool.isRequired,
    mode:                React.PropTypes.string.isRequired,
    onAnchorChange:      React.PropTypes.func.isRequired,
    onBoundingBoxChange: React.PropTypes.func.isRequired,
    onImageSelect:       React.PropTypes.func.isRequired,
    onSearchPageChange:  React.PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {basemapIndex: 0, selectedFeature: null}
    this._emitAnchorChange = debounce(this._emitAnchorChange.bind(this), 1000)
    this._handleBasemapChange = this._handleBasemapChange.bind(this)
    this._handleDrawStart = this._handleDrawStart.bind(this)
    this._handleDrawEnd = this._handleDrawEnd.bind(this)
    this._handleMouseMove = throttle(this._handleMouseMove.bind(this), 15)
    this._handleSelect = this._handleSelect.bind(this)
    this._handleThumbnailLoaded = this._handleThumbnailLoaded.bind(this)
    this._recenter = debounce(this._recenter.bind(this), 100)
    this._renderImagerySearchBbox = debounce(this._renderImagerySearchBbox.bind(this))
  }

  componentDidMount() {
    this._initializeOpenLayers()
      .then(() => {
        this._renderDetections()
        this._renderFrames()
        this._renderImagery()
        this._renderImagerySearchResultsOverlay()
        this._recenter(this.props.anchor)
        if (this.props.bbox) {
          this._renderImagerySearchBbox()
        }
        if (this.props.mode === MODE_DRAW_BBOX) {
          this._activateDrawInteraction()
        }
      })
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    if (process.env.NODE_ENV === 'development') {
      window.ol = ol
      window.map = this._map
      window.primaryMap = this
    }
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  }

  componentDidUpdate(previousProps, previousState) {  // eslint-disable-line complexity
    if (this.props.datasets !== previousProps.datasets) {
      this._renderDetections()
      this._renderFrames()
      this._renderProgressBars()
    }
    if (this.props.imagery !== previousProps.imagery) {
      this._renderImagery()
    }
    if (this.props.isSearching !== previousProps.isSearching) {
      this._renderImagerySearchResultsOverlay()
    }
    if (this.props.bbox !== previousProps.bbox) {
      this._renderImagerySearchBbox()
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
      <main className={styles.root} ref="container" tabIndex="1">
        <BasemapSelect
          className={styles.basemapSelect}
          index={this.state.basemapIndex}
          basemaps={basemapNames}
          onChange={this._handleBasemapChange}
        />
        <FeatureDetails
          ref="featureDetails"
          feature={this.state.selectedFeature}
          onThumbnailLoaded={this._handleThumbnailLoaded}
        />
        <ImagerySearchResults
          ref="imageSearchResults"
          imagery={this.props.imagery}
          isSearching={this.props.isSearching}
          onPageChange={this.props.onSearchPageChange}
        />
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
    this.setState({selectedFeature: null})
  }

  _clearThumbnail() {
    this._thumbnailLayer.setSource(null)
  }

  _deactivateDrawInteraction() {
    this._drawInteraction.setActive(false)
  }

  _deactivateSelectInteraction() {
    this._clearSelection()
    this._selectInteraction.setActive(false)
  }

  _emitAnchorChange() {
    const view = this._map.getView()
    const center = view.getCenter()
    const resolution = view.getResolution()
    const anchor = anchorUtil.serialize(center, resolution, this.state.basemapIndex)
    // Don't emit false positives
    if (this.props.anchor !== anchor) {
      this._skipNextRecenter = true
      this.props.onAnchorChange(anchor)
    }
  }

  _handleBasemapChange(index) {
    this.setState({basemapIndex: index})
    this._emitAnchorChange()
  }

  _handleDrawEnd(event) {
    const geometry = event.feature.getGeometry()
    const bbox = bboxUtil.serialize(geometry.getExtent())
    this.props.onBoundingBoxChange(bbox)
  }

  _handleDrawStart() {
    this._clearDraw()
    this.props.onBoundingBoxChange(null)
  }

  _handleMouseMove(event) {
    const excludingDraw = l => l !== this._drawLayer
    this._map.getTarget().style.cursor = this._map.hasFeatureAtPixel(event.pixel, excludingDraw) ? 'pointer' : 'default'
  }

  _handleSelect(event) {
    const {selected, deselected} = event
    if (selected.length === 0 && deselected.length === 0) {
      return  // Disregard spurious select event
    }

    const [feature] = selected
    const geojson = feature ? new ol.format.GeoJSON().writeFeatureObject(feature) : null
    const position = feature ? ol.extent.getCenter(feature.getGeometry().getExtent()) : undefined

    this._clearThumbnail()
    this.setState({selectedFeature: geojson})
    this._featureDetailsOverlay.setPosition(position)
    this.props.onImageSelect(geojson)
  }

  _handleThumbnailLoaded(image, feature) {
    if (!feature) {
      return
    }
    const reader = new ol.format.GeoJSON()
    this._thumbnailLayer.setSource(new ol.source.ImageStatic({
      crossOrigin: 'Anonymous',
      imageExtent: reader.readGeometry(feature.geometry, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'}).getExtent(),
      url:         image.src
    }))
  }

  _initializeOpenLayers() {
    this._basemapLayers = generateBasemapLayers(TILE_PROVIDERS)
    this._detectionsLayer = generateDetectionsLayer()
    this._drawLayer = generateDrawLayer()
    this._frameLayer = generateFrameLayer()
    this._imageryLayer = generateImageryLayer()
    this._thumbnailLayer = generateThumbnailLayer()

    this._drawInteraction = generateDrawInteraction(this._drawLayer)
    this._drawInteraction.on('drawstart', this._handleDrawStart)
    this._drawInteraction.on('drawend', this._handleDrawEnd)

    this._selectInteraction = generateSelectInteraction(this._frameLayer, this._imageryLayer)
    this._selectInteraction.on('select', this._handleSelect)

    this._progressBars = {}
    this._featureDetailsOverlay = generateFeatureDetailsOverlay(this.refs.featureDetails)
    this._imageSearchResultsOverlay = generateImageSearchResultsOverlay(this.refs.imageSearchResults)

    this._map = new ol.Map({
      controls: generateControls(),
      interactions: generateBaseInteractions().extend([this._drawInteraction, this._selectInteraction]),
      layers: [
        // Order matters here
        ...this._basemapLayers,
        this._frameLayer,
        this._drawLayer,
        this._imageryLayer,
        this._thumbnailLayer,
        this._detectionsLayer
      ],
      overlays: [
        this._imageSearchResultsOverlay,
        this._featureDetailsOverlay,
      ],
      target: this.refs.container,
      view: new ol.View({
        center: ol.proj.fromLonLat(INITIAL_CENTER),
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoom: MIN_ZOOM
      })
    })

    this._map.on('pointermove', this._handleMouseMove)
    this._map.on('moveend', this._emitAnchorChange)
    return new Promise(resolve => this._map.once('postrender', resolve))
  }

  _recenter(anchor) {
    if (this._skipNextRecenter) {
      this._skipNextRecenter = false
      return
    }
    const deserialized = anchorUtil.deserialize(anchor)
    if (deserialized) {
      const {basemapIndex, resolution, center} = deserialized
      this.setState({basemapIndex})
      const view = this._map.getView()
      view.setCenter(view.constrainCenter(center))
      view.setResolution(view.constrainResolution(resolution))
    }
  }

  _renderDetections() {
    const {datasets} = this.props
    const incomingJobs = {}
    datasets.filter(d => d.geojson).forEach(dataset => incomingJobs[dataset.job.id] = true)
    const source = this._detectionsLayer.getSource()
    const previous = {}

    // Removals (no updates)
    source.getFeatures().slice().forEach(feature => {
      const jobId = feature.get(KEY_OWNER_ID)
      previous[jobId] = true
      if (!incomingJobs[jobId]) {
        source.removeFeature(feature)
      }
    })

    // Additions
    const reader = new ol.format.GeoJSON()
    datasets.filter(d => d.geojson && !previous[d.job.id]).forEach(dataset => {
      const features = reader.readFeatures(dataset.geojson, {featureProjection: 'EPSG:3857'})
      features.forEach(f => f.set(KEY_OWNER_ID, dataset.job.id))
      source.addFeatures(features)
    })
  }

  _renderFrames() {
    const source = this._frameLayer.getSource()
    source.clear()
    const reader = new ol.format.GeoJSON()
    const features = this.props.datasets.map(({job}) => reader.readFeature(job, {featureProjection: 'EPSG:3857'}))
    source.addFeatures(features)
  }

  _renderImagery() {
    const {imagery} = this.props
    const reader = new ol.format.GeoJSON()
    const source = this._imageryLayer.getSource()
    source.setAttributions(undefined)
    source.clear()
    if (imagery) {
      const features = reader.readFeatures(imagery.images, {featureProjection: 'EPSG:3857'})
      if (features.length) {
        features.forEach(feature => {
          feature.set(KEY_TYPE, TYPE_SCENE)
        })
        source.setAttributions([
          '<a href="https://www.planet.com" target="_blank" rel="noopener">Planet Labs</a>',
          '<a href="https://landsat.usgs.gov" target="_blank" rel="noopener">LANDSAT (USGS)</a>',
        ])  // HACK -- this should be dynamic, not hardcoded
        source.addFeatures(features)
      }
    }
  }

  _renderImagerySearchResultsOverlay() {
    this._imageSearchResultsOverlay.setPosition(undefined)
    // HACK HACK HACK HACK HACK HACK HACK HACK
    const bbox = bboxUtil.deserialize(this.props.bbox)
    if (!bbox) {
      return  // Nothing to pin the overlay to
    }
    if (!this.props.imagery || this.props.isSearching) {
      return  // No results are in
    }

    if (this.props.imagery.count) {
      // Pager
      this._imageSearchResultsOverlay.setPosition(ol.extent.getBottomRight(bbox))
      this._imageSearchResultsOverlay.setPositioning('top-right')
    }
    else {
      // No results
      this._imageSearchResultsOverlay.setPosition(ol.extent.getCenter(bbox))
      this._imageSearchResultsOverlay.setPositioning('center-center')
    }
    // HACK HACK HACK HACK HACK HACK HACK HACK
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

  _renderImagerySearchBbox() {
    this._clearDraw()
    const bbox = bboxUtil.deserialize(this.props.bbox)
    if (!bbox) {
      return
    }
    const feature = new ol.Feature({
      geometry: ol.geom.Polygon.fromExtent(bbox)
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
      this._clearDraw()
      this._deactivateDrawInteraction()
      this._deactivateSelectInteraction()
      break
    default:
      console.warn('wat mode=%s', this.props.mode)
      break
    }
  }
}

function generateBasemapLayers(providers) {
  return providers.map((provider, index) => {
    const source = new ol.source.XYZ({...provider, crossOrigin: 'anonymous'})
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
      switch (feature.get(KEY_DETECTION)) {
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
      const labelText = `${feature.get(KEY_NAME).toUpperCase()} (${feature.get(KEY_STATUS)})`
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
            color: _getFillColor(feature.get(KEY_STATUS))
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

function generateFeatureDetailsOverlay(componentRef) {
  return new ol.Overlay({
    autoPan: true,
    element: findDOMNode(componentRef),
    id: 'featureDetails',
    positioning: 'top-left'
  })
}

function generateImageSearchResultsOverlay(componentRef) {
  return new ol.Overlay({
    autoPan: true,
    element: findDOMNode(componentRef),
    id: 'imageSearchResults',
    stopEvent: false
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
    position: ol.extent.getBottomLeft(bboxUtil.featureToBbox(dataset.job)),
    positioning: 'bottom-left'
  })
}

function generateSelectInteraction(...layers) {
  return new ol.interaction.Select({
    layers,
    condition: ol.events.condition.click,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 3
      }),
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

function generateThumbnailLayer() {
  return new ol.layer.Image()
}

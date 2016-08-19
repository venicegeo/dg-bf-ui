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
import LoadingAnimation from './LoadingAnimation'
import ImagerySearchResults from './ImagerySearchResults'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import * as anchorUtil from '../utils/map-anchor'
import * as bboxUtil from '../utils/bbox'
import styles from './PrimaryMap.css'
import {
  TILE_PROVIDERS,
  SCENE_TILE_PROVIDERS,
} from '../config'
import {
  KEY_NAME,
  KEY_STATUS,
  KEY_IMAGE_ID,
  KEY_TYPE,
  KEY_WMS_LAYER_ID,
  STATUS_ACTIVE,
  STATUS_ERROR,
  STATUS_INACTIVE,
  STATUS_RUNNING,
  STATUS_SUCCESS,
  STATUS_TIMED_OUT,
  TYPE_SCENE,
  TYPE_JOB,
} from '../constants'

const DEFAULT_CENTER = [110, 0]
const MIN_ZOOM = 2.5
const MAX_ZOOM = 22
const RESOLUTION_CLOSE = 1000
const STEM_OFFSET = 10000
const KEY_OWNER_ID = 'OWNER_ID'
const KEY_LAYERS = 'LAYERS'
const TYPE_DIVOT_INBOARD = 'DIVOT_INBOARD'
const TYPE_DIVOT_OUTBOARD = 'DIVOT_OUTBOARD'
const TYPE_LABEL_MAJOR = 'LABEL_MAJOR'
const TYPE_LABEL_MINOR = 'LABEL_MINOR'
const TYPE_STEM = 'STEM'
export const MODE_DRAW_BBOX = 'MODE_DRAW_BBOX'
export const MODE_NORMAL = 'MODE_NORMAL'
export const MODE_PRODUCT_LINES = 'MODE_PRODUCT_LINES'
export const MODE_SELECT_IMAGERY = 'MODE_SELECT_IMAGERY'

export default class PrimaryMap extends Component {
  static propTypes = {
    anchor:              React.PropTypes.string,
    bbox:                React.PropTypes.arrayOf(React.PropTypes.number),
    catalogApiKey:       React.PropTypes.string,
    detections:          React.PropTypes.arrayOf(React.PropTypes.shape({
      geometry:   React.PropTypes.object.isRequired,
      id:         React.PropTypes.string.isRequired,
      properties: React.PropTypes.object.isRequired,
      type:       React.PropTypes.string.isRequired,
    })).isRequired,
    imagery:             React.PropTypes.shape({
      count:      React.PropTypes.number.isRequired,
      startIndex: React.PropTypes.number.isRequired,
      images:     React.PropTypes.object.isRequired
    }),
    isSearching:         React.PropTypes.bool.isRequired,
    frames:              React.PropTypes.arrayOf(React.PropTypes.shape({
      geometry:   React.PropTypes.object.isRequired,
      id:         React.PropTypes.string.isRequired,
      properties: React.PropTypes.object.isRequired,
      type:       React.PropTypes.string.isRequired,
    })).isRequired,
    geoserverUrl:        React.PropTypes.string,
    mode:                React.PropTypes.string.isRequired,
    selectedProductLineJob: React.PropTypes.object,
    onAnchorChange:      React.PropTypes.func.isRequired,
    onBoundingBoxChange: React.PropTypes.func.isRequired,
    onSelectImage:       React.PropTypes.func.isRequired,
    onSelectJob:         React.PropTypes.func.isRequired,
    onSearchPageChange:  React.PropTypes.func.isRequired,
    highlightedFeature:  React.PropTypes.object,
    selectedFeature:     React.PropTypes.object,
  }

  constructor() {
    super()
    this.state = {basemapIndex: 0, loadingRefCount: 0}
    this._emitAnchorChange = debounce(this._emitAnchorChange.bind(this), 1000)
    this._handleBasemapChange = this._handleBasemapChange.bind(this)
    this._handleDrawStart = this._handleDrawStart.bind(this)
    this._handleDrawEnd = this._handleDrawEnd.bind(this)
    this._handleLoadStart = this._handleLoadStart.bind(this)
    this._handleLoadStop = this._handleLoadStop.bind(this)
    this._handleMouseMove = throttle(this._handleMouseMove.bind(this), 15)
    this._handleSelect = this._handleSelect.bind(this)
    this._recenter = debounce(this._recenter.bind(this), 100)
    this._renderImagerySearchBbox = debounce(this._renderImagerySearchBbox.bind(this))
  }

  componentDidMount() {
    this._initializeOpenLayers()
      .then(() => {
        this._renderSelectionPreview()
        this._renderDetections()
        this._renderFrames()
        this._renderImagery()
        this._renderImagerySearchResultsOverlay()
        this._recenter(this.props.anchor)
        if (this.props.bbox) {
          this._renderImagerySearchBbox()
        }
        this._updateInteractions()
        if (this.props.selectedFeature) {
          this._updateSelectedFeature()
        }
      })
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    window.ol = ol
    window.map = this._map
    window.primaryMap = this
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  }

  componentDidUpdate(previousProps, previousState) {  // eslint-disable-line complexity
    if (!this.props.selectedFeature) {
      this._clearSelection()
    }
    if (previousProps.selectedFeature !== this.props.selectedFeature) {
      this._renderSelectionPreview()
    }
    if (previousProps.detections !== this.props.detections) {
      this._renderDetections()
    }
    if (previousProps.highlightedFeature !== this.props.highlightedFeature) {
      this._renderHighlight()
    }
    if (previousProps.frames !== this.props.frames) {
      this._renderFrames()
    }
    if (previousProps.imagery !== this.props.imagery) {
      this._renderImagery()
    }
    if (previousProps.isSearching !== this.props.isSearching) {
      this._clearSelection()
      this._renderImagerySearchResultsOverlay()
    }
    if (previousProps.bbox !== this.props.bbox) {
      this._renderImagerySearchBbox()
    }
    if (previousState.basemapIndex !== this.state.basemapIndex) {
      this._updateBasemap()
    }
    if (previousProps.anchor !== this.props.anchor && this.props.anchor) {
      this._recenter(this.props.anchor)
    }
    if (previousProps.mode !== this.props.mode) {
      this._updateInteractions()
    }
  }

  render() {
    const basemapNames = TILE_PROVIDERS.map(b => b.name)
    return (
      <main className={`${styles.root} ${this.state.loadingRefCount > 0 ? styles.isLoading : ''}`} ref="container" tabIndex="1">
        <BasemapSelect
          className={styles.basemapSelect}
          index={this.state.basemapIndex}
          basemaps={basemapNames}
          onChange={this._handleBasemapChange}
        />
        <FeatureDetails
          ref="featureDetails"
          feature={this.props.selectedFeature}
        />
        <ImagerySearchResults
          ref="imageSearchResults"
          imagery={this.props.imagery}
          isSearching={this.props.isSearching}
          onPageChange={this.props.onSearchPageChange}
        />
        <LoadingAnimation
          className={styles.loadingIndicator}
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

  _clearFrames() {
    this._frameLayer.getSource().clear()
  }

  _clearSelection() {
    this._selectInteraction.getFeatures().clear()
  }

  _deactivateDrawInteraction() {
    this._drawInteraction.setActive(false)
  }

  _deactivateSelectInteraction() {
    this._clearSelection()
    this._emitDeselectAll()
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

  _emitDeselectAll() {
    this.props.onSelectImage(null)
    this.props.onSelectJob(null)
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

  _handleLoadStart() {
    this.setState({
      loadingRefCount: this.state.loadingRefCount + 1
    })
  }

  _handleLoadStop() {
    this.setState({
      loadingRefCount: Math.max(0, this.state.loadingRefCount - 1)
    })
  }

  _handleMouseMove(event) {
    const layerFilter = l => l === this._frameLayer || l === this._imageryLayer
    let foundFeature = false
    this._map.forEachFeatureAtPixel(event.pixel, (feature) => {
      switch (feature.get(KEY_TYPE)) {
      case TYPE_DIVOT_INBOARD:
      case TYPE_JOB:
      case TYPE_SCENE:
        foundFeature = true
        return true
      }
    }, null, layerFilter)
    if (foundFeature) {
      this.refs.container.classList.add(styles.isHoveringFeature)
    }
    else {
      this.refs.container.classList.remove(styles.isHoveringFeature)
    }
  }

  _handleSelect(event) {  // eslint-disable-line complexity
    if (event.selected.length === 0 && event.deselected.length === 0) {
      return  // Disregard spurious select event
    }

    const [feature] = event.selected
    let position, type
    if (feature) {
      position = ol.extent.getCenter(feature.getGeometry().getExtent())
      type = feature.get(KEY_TYPE)
    }

    this._featureDetailsOverlay.setPosition(position)

    const selections = this._selectInteraction.getFeatures()
    switch (type) {
    case TYPE_DIVOT_INBOARD:
    case TYPE_STEM:
      // Proxy clicks on "inner" decorations out to the job frame itself
      const jobId = feature.get(KEY_OWNER_ID)
      const jobFeature = this._frameLayer.getSource().getFeatureById(jobId)
      selections.clear()
      selections.push(jobFeature)
      this.props.onSelectImage(null)
      this.props.onSelectJob(jobId)
      break
    case TYPE_JOB:
      this.props.onSelectImage(null)
      this.props.onSelectJob(feature.getId())
      break
    case TYPE_SCENE:
      const writer = new ol.format.GeoJSON()
      const geojson = writer.writeFeatureObject(feature, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
      this.props.onSelectImage(geojson)
      this.props.onSelectJob(null)
      break
    default:
      // Not a valid "selectable" feature
      this._clearSelection()
      this._emitDeselectAll()
      break
    }
  }

  _initializeOpenLayers() {
    this._basemapLayers = generateBasemapLayers(TILE_PROVIDERS)
    this._detectionsLayer = generateDetectionsLayer()
    this._drawLayer = generateDrawLayer()
    this._highlightLayer = generateHighlightLayer()
    this._frameLayer = generateFrameLayer()
    this._imageryLayer = generateImageryLayer()
    this._previewLayers = {}
    this._subscribeToLoadEvents(this._detectionsLayer)

    this._drawInteraction = generateDrawInteraction(this._drawLayer)
    this._drawInteraction.on('drawstart', this._handleDrawStart)
    this._drawInteraction.on('drawend', this._handleDrawEnd)

    this._selectInteraction = generateSelectInteraction(this._frameLayer, this._imageryLayer)
    this._selectInteraction.on('select', this._handleSelect)

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
        this._detectionsLayer,
        this._highlightLayer,
      ],
      overlays: [
        this._imageSearchResultsOverlay,
        this._featureDetailsOverlay,
      ],
      target: this.refs.container,
      view: new ol.View({
        center: ol.proj.fromLonLat(DEFAULT_CENTER),
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
    const {detections, geoserverUrl} = this.props
    const layer = this._detectionsLayer
    const source = layer.getSource()
    const currentLayerIds = source.getParams()[KEY_LAYERS]
    const incomingLayerIds = detections.map(d => d.properties[KEY_WMS_LAYER_ID]).sort().join(',')

    if (!geoserverUrl) {
      return  // No server to point to
    }
    if (currentLayerIds === incomingLayerIds) {
      return  // Nothing to do
    }

    // Removals
    if (!incomingLayerIds && currentLayerIds) {
      layer.setExtent([0, 0, 0, 0])
      layer.setSource(generateDetectionsSource())
      return
    }

    // Additions/Updates
    const extent = ol.extent.createEmpty()
    detections.forEach(d => ol.extent.extend(extent, bboxUtil.featureToBbox(d)))
    layer.setExtent(extent)
    source.updateParams({
      [KEY_LAYERS]: incomingLayerIds,
    })
    source.setUrl(`${geoserverUrl}/wms`)
  }

  _renderFrames() {
    this._clearFrames()

    const source = this._frameLayer.getSource()
    const reader = new ol.format.GeoJSON()
    this.props.frames.forEach(raw => {
      const frame = reader.readFeature(raw, {featureProjection: 'EPSG:3857'})
      source.addFeature(frame)

      const frameExtent = frame.getGeometry().getExtent()
      const topRight = ol.extent.getTopRight(ol.extent.buffer(frameExtent, STEM_OFFSET))
      const center = ol.extent.getCenter(frameExtent)
      const id = frame.getId()

      const stem = new ol.Feature({
        geometry: new ol.geom.LineString([
          center,
          topRight
        ])
      })
      stem.set(KEY_TYPE, TYPE_STEM)
      stem.set(KEY_OWNER_ID, id)
      source.addFeature(stem)

      const divotInboard = new ol.Feature({
        geometry: new ol.geom.Point(center)
      })
      divotInboard.set(KEY_TYPE, TYPE_DIVOT_INBOARD)
      divotInboard.set(KEY_OWNER_ID, id)
      source.addFeature(divotInboard)

      const divotOutboard = new ol.Feature({
        geometry: new ol.geom.Point(topRight)
      })
      divotOutboard.set(KEY_TYPE, TYPE_DIVOT_OUTBOARD)
      divotOutboard.set(KEY_OWNER_ID, id)
      divotOutboard.set(KEY_STATUS, frame.get(KEY_STATUS))
      source.addFeature(divotOutboard)

      const name = new ol.Feature({
        geometry: new ol.geom.Point(topRight)
      })
      name.set(KEY_TYPE, TYPE_LABEL_MAJOR)
      name.set(KEY_OWNER_ID, id)
      name.set(KEY_NAME, frame.get(KEY_NAME).toUpperCase())
      source.addFeature(name)

      const status = new ol.Feature({
        geometry: new ol.geom.Point(topRight)
      })
      status.set(KEY_TYPE, TYPE_LABEL_MINOR)
      status.set(KEY_OWNER_ID, id)
      status.set(KEY_STATUS, frame.get(KEY_STATUS))
      status.set(KEY_IMAGE_ID, frame.get(KEY_IMAGE_ID))
      source.addFeature(status)
    })
  }

  _renderHighlight() {
    const source = this._highlightLayer.getSource()
    source.clear()

    const geojson = this.props.highlightedFeature
    if (!geojson) {
      return
    }

    const reader = new ol.format.GeoJSON()
    const feature = reader.readFeature(geojson, {featureProjection: 'EPSG:3857'})

    source.addFeature(feature)
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

  _renderSelectionPreview() {
    const images = featuresToImages(this.props.selectedFeature)
    const shouldRender = {}
    const alreadyRendered = {}

    images.forEach(i => shouldRender[i.id] = true)

    // Removals
    Object.keys(this._previewLayers).forEach(imageId => {
      const layer = this._previewLayers[imageId]
      alreadyRendered[imageId] = true
      if (!shouldRender[imageId]) {
        this._unsubscribeFromLoadEvents(layer)
        delete this._previewLayers[imageId]
        animateLayerExit(layer).then(() => {
          this._map.removeLayer(layer)
        })
      }
    })

    // Additions
    const insertionIndex = this._basemapLayers.length
    images.filter(i => shouldRender[i.id] && !alreadyRendered[i.id]).forEach(image => {
      const chunks = image.id.match(/^(\w+):(.*)$/)
      if (!chunks) {
        console.warn('(@primaryMap._renderSelectionPreview) Invalid image ID: `%s`', image.id)
        return
      }

      const [, prefix, externalImageId] = chunks
      const provider = SCENE_TILE_PROVIDERS.find(p => p.prefix === prefix)
      if (!provider) {
        console.warn('(@primaryMap._renderSelectionPreview) No provider available for image `%s`', image.id)
        return
      }

      // HACK HACK HACK HACK
      const apiKey = this.props.catalogApiKey
      // HACK HACK HACK HACK

      const layer = new ol.layer.Tile({
        extent: image.extent,
        source: generateScenePreviewSource(provider, externalImageId, apiKey)
      })

      this._subscribeToLoadEvents(layer)
      this._previewLayers[image.id] = layer
      this._map.getLayers().insertAt(insertionIndex, layer)
    })
  }

  _subscribeToLoadEvents(layer) {
    const source = layer.getSource()
    source.on('tileloadstart', this._handleLoadStart)
    source.on(['tileloadend', 'tileloaderror'], this._handleLoadStop)
  }

  _unsubscribeFromLoadEvents(layer) {
    const source = layer.getSource()
    source.un('tileloadstart', this._handleLoadStart)
    source.un(['tileloadend', 'tileloaderror'], this._handleLoadStop)
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
      this._activateDrawInteraction()
      this._deactivateSelectInteraction()
      break
    case MODE_NORMAL:
      this._clearDraw()
      this._deactivateDrawInteraction()
      this._activateSelectInteraction()
      break
    case MODE_PRODUCT_LINES:
      this._clearDraw()
      this._deactivateDrawInteraction()
      this._activateSelectInteraction()
      break
    default:
      console.warn('wat mode=%s', this.props.mode)
      break
    }
  }

  _updateSelectedFeature() {
    const reader = new ol.format.GeoJSON()
    const feature = reader.readFeature(this.props.selectedFeature, {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})
    const center = ol.extent.getCenter(feature.getGeometry().getExtent())
    this._selectInteraction.getFeatures().push(feature)
    this._featureDetailsOverlay.setPosition(center)
  }
}

function animateLayerExit(layer) {
  return new Promise(resolve => {
    const step = 0.075
    let opacity = 1
    const tick = () => {
      if (opacity > 0) {
        opacity -= step
        layer.setOpacity(opacity)
        requestAnimationFrame(tick)
      } else {
        resolve(layer)
      }
    }
    requestAnimationFrame(tick)
  })
}

function featuresToImages(...features) {
  return features.filter(Boolean).map(feature => ({
    extent: bboxUtil.featureToBbox(feature),
    id:     feature.properties[KEY_IMAGE_ID] || feature.id,
  }))
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
  return new ol.layer.Tile({
    source: generateDetectionsSource(),
  })
}

function generateDetectionsSource() {
  return new ol.source.TileWMS({
    crossOrigin: 'anonymous',
    params: {
      [KEY_LAYERS]: '',
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
  return new ol.layer.Vector({
    source: new ol.source.Vector(),
    style(feature, resolution) {  // eslint-disable-line complexity
      const isClose = resolution < RESOLUTION_CLOSE
      switch (feature.get(KEY_TYPE)) {
      case TYPE_DIVOT_INBOARD:
        return new ol.style.Style({
          image: new ol.style.RegularShape({
            angle: Math.PI / 4,
            points: 4,
            radius: 5,
            fill: new ol.style.Fill({
              color: 'black'
            })
          })
        })
      case TYPE_DIVOT_OUTBOARD:
        return new ol.style.Style({
          image: new ol.style.RegularShape({
            angle: Math.PI / 4,
            points: 4,
            radius: 10,
            stroke: new ol.style.Stroke({
              color: 'black',
              width: 1
            }),
            fill: new ol.style.Fill({
              color: getColorForStatus(feature.get(KEY_STATUS))
            })
          })
        })
      case TYPE_STEM:
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'black',
            width: 1
          })
        })
      case TYPE_LABEL_MAJOR:
        return new ol.style.Style({
          text: new ol.style.Text({
            fill: new ol.style.Fill({
              color: 'black'
            }),
            offsetX: 13,
            offsetY: 1,
            font: 'bold 17px Catamaran, Verdana, sans-serif',
            text: feature.get(KEY_NAME).toUpperCase(),
            textAlign: 'left',
            textBaseline: 'middle'
          })
        })
      case TYPE_LABEL_MINOR:
        return new ol.style.Style({
          text: new ol.style.Text({
            fill: new ol.style.Fill({
              color: 'rgba(0,0,0,.6)'
            }),
            offsetX: 13,
            offsetY: 15,
            font: '11px Verdana, sans-serif',
            text: ([
              feature.get(KEY_STATUS),
              feature.get(KEY_IMAGE_ID),
            ].filter(Boolean)).join(' // ').toUpperCase(),
            textAlign: 'left',
            textBaseline: 'middle'
          })
        })
      default:
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, .4)',
            lineDash: [10, 10]
          }),
          fill: new ol.style.Fill({
            color: isClose ? 'transparent' : 'hsla(202, 100%, 85%, 0.5)'
          })
        })
      }
    }
  })
}

function generateHighlightLayer() {
  return new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'hsla(90, 100%, 30%, .5)',
      }),
      stroke: new ol.style.Stroke({
        color: 'hsla(90, 100%, 30%, .6)',
      }),
    }),
  })
}

function generateImageryLayer() {
  return new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0,0,0, .15)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0,0,0, .5)',
        width: 1
      })
    })
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

function generateScenePreviewSource(provider, imageId, apiKey) {
  return new ol.source.XYZ({
    ...provider,
    crossOrigin: 'anonymous',
    url: provider.url
           .replace('__IMAGE_ID__', imageId)
           .replace('__API_KEY__', apiKey),
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

function getColorForStatus(status) {
  switch (status) {
  case STATUS_ACTIVE: return 'hsl(200, 94%, 54%)'
  case STATUS_INACTIVE: return 'hsl(0, 0%, 50%)'
  case STATUS_RUNNING: return 'hsl(48, 94%, 54%)'
  case STATUS_SUCCESS: return 'hsl(114, 100%, 45%)'
  case STATUS_TIMED_OUT:
  case STATUS_ERROR: return 'hsl(349, 100%, 60%)'
  default: return 'magenta'
  }
}

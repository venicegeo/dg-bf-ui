import 'openlayers/dist/ol.css'
import React, {Component} from 'react'
import openlayers from 'openlayers'
import styles from './PrimaryMap.less'
import {TILE_PROVIDERS} from '../config'

const [DEFAULT_TILE_PROVIDER] = TILE_PROVIDERS
const INITIAL_CENTER = [-20, 0]
const INITIAL_ZOOM = 2.5
const DETECTED = 'Detected'
const UNDETECTED = 'Undetected'
const NEW_DETECTION = 'New Detection'

export default class PrimaryMap extends Component {
  static propTypes = {
    featureCollections: React.PropTypes.array
  }

  constructor() {
    super()
    this._layers = []
    this._export = this._export.bind(this)
    this._generateStyles = this._generateStyles.bind(this)
  }

  componentDidMount() {
    this._initializeOpenLayers(DEFAULT_TILE_PROVIDER)
    this._renderLayers()
  }

  componentDidUpdate() {
    this._clearLayers()
    this._renderLayers()
  }

  render() {
    return (
      <div className={styles.root} ref="container">
        <div className={styles['export-button']} title="Click to export an image of this map">
          <a ref="downloadButton"
             download="map.png"
             onClick={this._export}>
            <i className="fa fa-download"/>
          </a>
        </div>
      </div>
    )
  }

  //
  // Internals
  //

  _initializeOpenLayers(provider) {
    this._map = new openlayers.Map({
      controls: this._generateControls(),
      layers: this._generateBasemapLayers(provider),
      target: this.refs.container,
      view: new openlayers.View({
        center: openlayers.proj.fromLonLat(INITIAL_CENTER),
        minZoom: INITIAL_ZOOM,
        maxZoom: provider.maxZoom,
        zoom: INITIAL_ZOOM
      })
    })
  }

  _clearLayers() {
    this._layers.forEach(layer => this._map.removeLayer(layer))
  }

  _renderLayers() {
    const featureCollections = this.props.featureCollections
    if (!featureCollections || !featureCollections.length) { return }
    const viewport = openlayers.extent.createEmpty()
    const reader = new openlayers.format.GeoJSON()
    featureCollections.forEach(featureCollection => {
      const bounds = openlayers.extent.createEmpty()
      const features = reader.readFeatures(featureCollection.geojson, {featureProjection:'EPSG:3857'})
      features.forEach(feature => {
        const source = new openlayers.source.Vector({features: [feature]})
        const layer = new openlayers.layer.Vector({source, style: this._generateStyles})
        openlayers.extent.extend(bounds, source.getExtent())
        openlayers.extent.extend(viewport, source.getExtent())
        this._layers.push(layer)
        this._map.addLayer(layer)
      })
      const frame = this._generateFrame(bounds, featureCollection.name)
      this._layers.push(frame)
      this._map.addLayer(frame)
    })
    this._map.getView().fit(viewport, this._map.getSize())
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

  _generateBasemapLayers(provider) {
    return [
      new openlayers.layer.Tile({
        source: new openlayers.source.XYZ(Object.assign({crossOrigin: 'anonymous'}, provider))
      })
    ];
  }

  _generateControls() {
    return openlayers.control.defaults({
      attributionOptions: {collapsible: false}
    }).extend([
      new openlayers.control.ScaleLine({
        minWidth: 250,
        units: 'nautical'
      }),
      new openlayers.control.ZoomSlider(),
      new openlayers.control.MousePosition({
        coordinateFormat: openlayers.coordinate.toStringHDMS
      }),
      new openlayers.control.FullScreen()
    ])
  }

  _generateFrame(bounds, title) {
    return new openlayers.layer.Vector({
      source: new openlayers.source.Vector({
        features: [new openlayers.Feature({
          geometry: openlayers.geom.Polygon.fromExtent(bounds)
        })]
      }),
      style: new openlayers.style.Style({
        stroke: new openlayers.style.Stroke({
          color: 'rgba(0, 0, 0, .2)',
          lineDash: [20, 20],
          weight: 5
        }),
        text: new openlayers.style.Text({
          text: title,
          font: 'bold 15px Menlo, monospace',
          fill: new openlayers.style.Fill({
            color: 'rgba(0, 0, 0, .2)'
          })
        })
      })
    })
  }

  _generateStyles(feature) {
    const geometry = feature.getGeometry()
    switch (feature.get('detection')) {
      case DETECTED:
        const [baseline, detection] = geometry.getGeometries()
        return [this._generateStyleDetectionBaseline(baseline), this._generateStyleDetection(detection)]
      case UNDETECTED:
        return [this._generateStyleUndetected()]
      case NEW_DETECTION:
        return [this._generateStyleNewDetection()]
      default:
        return [this._generateStyleUnknownDetectionType()]
    }
  }

  _generateStyleDetectionBaseline(baseline) {
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

  _generateStyleDetection(detection) {
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

  _generateStyleUndetected() {
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

  _generateStyleNewDetection() {
    return new openlayers.style.Style({
      stroke: new openlayers.style.Stroke({
        width: 2,
        color: 'hsl(205, 100%, 50%)'
      })
    })
  }

  _generateStyleUnknownDetectionType() {
    return new openlayers.style.Style({
      stroke: new openlayers.style.Stroke({
        color: 'magenta',
        width: 2
      })
    })
  }
}

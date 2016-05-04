import 'openlayers/dist/ol.css';
import React, {Component} from 'react';
import ol from 'openlayers';
import styles from './MapWidget.less';
import {TILE_PROVIDERS} from '../config';

const [DEFAULT_TILE_PROVIDER] = TILE_PROVIDERS;
const INITIAL_CENTER = [-20, 0];
const INITIAL_ZOOM = 2.5;
const DETECTED = 'Detected';
const UNDETECTED = 'Undetected';
const NEW_DETECTION = 'New Detection';

export default class MapWidget extends Component {
  static propTypes = {
    featureCollections: React.PropTypes.array
  };

  constructor() {
    super();
    this._layers = [];
    this._export = this._export.bind(this);
  }

  componentDidMount() {
    this._initializeOpenLayers(DEFAULT_TILE_PROVIDER);
    this._renderLayers();
  }

  componentDidUpdate() {
    this._clearLayers();
    this._renderLayers();
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
    );
  }

  _clearLayers() {
    this._layers.forEach(layer => this._map.removeLayer(layer));
  }

  _renderLayers() {
    const featureCollections = this.props.featureCollections;
    if (!featureCollections || !featureCollections.length) { return; }
    const viewport = ol.extent.createEmpty();
    const reader = new ol.format.GeoJSON();
    featureCollections.forEach(featureCollection => {
      const bounds = ol.extent.createEmpty();
      const features = reader.readFeatures(featureCollection.geojson);
      features.forEach(feature => {
        const source = new ol.source.Vector({features: [feature]});
        const layer = new ol.layer.Vector({source, style: generateStyles});
        ol.extent.extend(bounds, source.getExtent());
        ol.extent.extend(viewport, source.getExtent());
        this._layers.push(layer);
        this._map.addLayer(layer);
      });
      const frame = generateFrame(bounds, featureCollection.name);
      this._layers.push(frame);
      this._map.addLayer(frame);
    });
    this._map.getView().fit(viewport, this._map.getSize());
  }

  _initializeOpenLayers(provider) {
    const projection = ol.proj.get('EPSG:4326');
    this._map = new ol.Map({
      projection,
      target: this.refs.container,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ(Object.assign({crossOrigin: 'anonymous'}, provider))
        })
      ],
      view: new ol.View({
        projection,
        center: ol.proj.fromLonLat(INITIAL_CENTER),
        minZoom: INITIAL_ZOOM,
        maxZoom: provider.maxZoom,
        zoom: INITIAL_ZOOM
      }),
      controls: ol.control.defaults({
        attributionOptions: {collapsible: false}
      }).extend([
        new ol.control.ScaleLine({
          minWidth: 250,
          units: 'nautical'
        }),
        new ol.control.ZoomSlider(),
        new ol.control.MousePosition({
          coordinateFormat: ol.coordinate.toStringHDMS
        }),
        new ol.control.FullScreen()
      ])
    });
  }

  _export() {
    const timestamp = new Date().toISOString().replace(/(\D+|\.\d+)/g, '');
    const element = this.refs.downloadButton;
    element.download = `BEACHFRONT_EXPORT_${timestamp}.png`;
    this._map.once('postcompose', event => {
      const canvas = event.context.canvas;
      element.href = canvas.toDataURL();
    });
    this._map.renderSync();
  }
}

//
// Internals
//

function generateFrame(bounds, title) {
  return new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [new ol.Feature({
        geometry: ol.geom.Polygon.fromExtent(bounds)
      })]
    }),
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, .2)',
        lineDash: [20, 20],
        weight: 5
      }),
      text: new ol.style.Text({
        text: title,
        font: 'bold 15px Menlo, monospace',
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 0, .2)'
        })
      })
    })
  });
}

// FIXME - seems inefficient, newing these .style.* things up _every single time_ but looks like an OL convention?
function generateStyles(feature) {
  const geometry = feature.getGeometry();
  switch (feature.get('detection')) {
    case DETECTED:
      const [baseline, detection] = geometry.getGeometries();
      return [generateStyleDetectionBaseline(baseline), generateStyleDetection(detection)];
    case UNDETECTED:
      return [generateStyleUndetected()];
    case NEW_DETECTION:
      return [generateStyleNewDetection()];
    default:
      return [generateStyleUnknownDetectionType()];
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
  });
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
  });
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
  });
}

function generateStyleNewDetection() {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      width: 2,
      color: 'hsl(205, 100%, 50%)'
    })
  });
}

function generateStyleUnknownDetectionType() {
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'magenta',
      width: 2
    })
  });
}

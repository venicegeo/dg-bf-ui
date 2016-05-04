import React, {Component} from 'react';
import ol from 'openlayers';
import {TILE_PROVIDERS} from '../config';
import styles from './InputTypeBoundingBox.less';

const [DEFAULT_TILE_PROVIDER] = TILE_PROVIDERS;

export const TYPE_BOUNDINGBOX = 'bbox';

export default class InputTypeBoundingBox extends Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor() {
    super();
    this.state = {expanded: true};
    this._toggleExpansion = this._toggleExpansion.bind(this);
    this._onDrawEnd = this._onDrawEnd.bind(this);
    this._onDrawStart = this._onDrawStart.bind(this);
  }

  componentDidMount() {
    this._initializeMap();
  }

  componentDidUpdate() {
    this._initializeMap();
  }

  componentWillUnmount() {
    this._destroyMap();
  }

  render() {
    const {expanded} = this.state;
    return (
      <div className={`${styles.root} ${expanded ? styles.expanded : ''}`}>
        <div className={styles.titlebar}>
          <span className={styles.toggle} onClick={this._toggleExpansion}>
            <i className="fa fa-angle-right"/>
          </span>
          <span className={styles.name}>{this.props.name}</span>
          <span className={styles.instructions}>Select bounding box</span>
        </div>
        {expanded && <div ref="target" className="map"></div>}
      </div>
    );
  }

  get value() {
    return this.state.bbox;
  }

  //
  // Internal API
  //

  _initializeMap() {
    if (!this.state.expanded) { return; }
    if (this._map) {
      this._map.setTarget(this.refs.target);
      return;
    }
    const view = this._generateView();
    const tiles = this._generateTileLayer(view);
    const vector = this._generateVectorLayer();
    const draw = this._generateDrawInteraction(vector);
    this._map = new ol.Map({
      view,
      target: this.refs.target,
      layers: [tiles, vector],
      interactions: ol.interaction.defaults().extend([draw]),
      controls: [new ol.control.Zoom()]
    });
  }

  _destroyMap() {
    this._map.setTarget(null);
    this._map = null;
  }

  _clearSelection() {
    const layer = this._map.getLayers().item(1);
    layer.getSource().clear();
    this.setState({bbox: null});
  }

  _generateView() {
    return new ol.View({
      projection: ol.proj.get('EPSG:4326'),
      center: [-30, -10],
      zoom: 1
    });
  }

  _generateTileLayer(view) {
    // TODO -- find super lightweight map tiles for this
    return new ol.layer.Tile({
      source: new ol.source.XYZ(Object.assign({
        projection: view.getProjection()
      }, DEFAULT_TILE_PROVIDER))
    });
  }

  _generateVectorLayer() {
    return new ol.layer.Vector({
      source: new ol.source.Vector({wrapX: false}),
      style: this._generateSelectionStyle()
    });
  }

  _generateSelectionStyle() {
    // TODO -- animation enhancements
    // TODO -- change bead styling
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'red',
        lineDash: [10, 10],
        weight: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,0,0, .5)'
      })
    })
  }

  _generateDrawInteraction(layer) {
    const interaction = new ol.interaction.Draw({
      source: layer.getSource(),
      type: 'LineString',
      maxPoints: 2,
      geometryFunction(coordinates, geometry) {
        geometry = geometry || new ol.geom.Polygon(null);
        const [[x1, y1], [x2, y2]] = coordinates;
        geometry.setCoordinates([[[x1, y1], [x1, y2], [x2, y2], [x2, y1], [x1, y1]]]);
        return geometry;
      }
    });
    interaction.on('drawstart', this._onDrawStart);
    interaction.on('drawend', this._onDrawEnd);
    return interaction;
  }

  _toggleExpansion() {
    this.setState({expanded: !this.state.expanded});
  }

  //
  // Events
  //

  _onDrawStart() {
    this._clearSelection();
  }

  _onDrawEnd(event) {
    // TODO restrict if too big
    // TODO zoom in on feature
    const geometry = event.feature.getGeometry();
    this.setState({
      bbox: geometry.getExtent()
    });
  }
}

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

import React, {Component} from 'react'
import ol from 'openlayers'
import {TILE_PROVIDERS} from '../config'
import {deserialize} from '../utils/bbox'
import styles from './StaticMinimap.css'

const [DEFAULT_TILE_PROVIDER] = TILE_PROVIDERS

export default class StaticMinimap extends Component {
  static propTypes = {
    bbox: React.PropTypes.arrayOf(React.PropTypes.number)
  }

  componentDidMount() {
    this._initializeMap()
  }

  componentWillUnmount() {
    this._destroyMap()
  }

  render() {
    return (
      <div ref="target" className={styles.root}/>
    )
  }

  //
  // Internal API
  //

  _initializeMap() {
    const bbox = deserialize(this.props.bbox)
    const bboxGeometry = ol.geom.Polygon.fromExtent(bbox)
    this._map = new ol.Map({
      controls: [],
      interactions: [],
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({...DEFAULT_TILE_PROVIDER})
        }),
        new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [
              new ol.Feature({
                geometry: bboxGeometry
              })
            ]
          }),
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'hsla(202, 70%, 50%, .3)'
            }),
            stroke: new ol.style.Stroke({
              color: 'hsla(202, 70%, 50%, .7)',
              lineCap: 'square',
              lineJoin: 'square',
              width: 2
            })
          })
        })
      ],
      target: this.refs.target,
      view: new ol.View({
        center: ol.proj.fromLonLat([0, 0]),
        zoom: 1,
        maxZoom: 6
      })
    })
    this._map.getView().fit(bboxGeometry, this._map.getSize())
  }

  _destroyMap() {
    this._map.setTarget(null)
    this._map = null
  }
}

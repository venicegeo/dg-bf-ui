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
import moment from 'moment'
import styles from './ImageDetails.css'

const KEY_DATE = 'acquiredDate'
const KEY_BANDS = 'bands'
const KEY_CLOUD_COVER = 'cloudCover'
const KEY_SENSOR_NAME = 'sensorName'
const KEY_THUMBNAIL = 'thumbnail'

export default class ImageDetails extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    feature: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {thumbnail: null}
  }

  render() {
    const {feature} = this.props
    if (!feature) {
      return <div role="no-feature-selected"/>
    }

    const id = normalizeId(feature.id)
    return (
      <div className={styles.root}>
        <h1 title={id}>{id}</h1>

        <dl>
          <dt>Thumbnail</dt>
          <dd><a className={styles.thumbnailLink} href={feature.properties[KEY_THUMBNAIL]} target="_blank">Click here to open</a></dd>
          <dt>Date Captured</dt>
          <dd>{moment(feature.properties[KEY_DATE]).format('llll')}</dd>

          <dt>Bands</dt>
          <dd>{Object.keys(feature.properties[KEY_BANDS]).join(', ')}</dd>

          <dt>Cloud Cover</dt>
          <dd>{feature.properties[KEY_CLOUD_COVER]}%</dd>

          <dt>Sensor Name</dt>
          <dd>{feature.properties[KEY_SENSOR_NAME]}</dd>
        </dl>
      </div>
    )
  }
}

function normalizeId(featureId) {
  if (!featureId) {
    return 'nil'
  }
  return featureId.replace(/^(pl:)?landsat:/i, '')
}

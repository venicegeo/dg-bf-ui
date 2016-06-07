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
          {/*
          <dt>Thumbnail</dt>
          <dd><img ref="thumbnail" crossOrigin={true} src={feature.get(KEY_THUMBNAIL)}/></dd>
          */}
          <dt>Date Captured</dt>
          <dd>{moment(feature.properties[KEY_DATE]).format('llll')}</dd>

          <dt>Bands</dt>
          <dd>{Object.keys(feature.properties[KEY_BANDS]).join(', ')}</dd>

          <dt>Cloud Cover</dt>
          <dd>{feature.properties[KEY_CLOUD_COVER]}</dd>

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
  return featureId.replace('pl:landsat:', '')
}

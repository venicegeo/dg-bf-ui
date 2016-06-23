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
import JobFeatureDetails from './JobFeatureDetails'
import SceneFeatureDetails from './SceneFeatureDetails'
import LoadFailed from './LoadFailed'
import LoadingAnimation from './LoadingAnimation'
import {fetchThumbnail} from '../utils/fetch-thumbnail'
import styles from './FeatureDetails.css'

const KEY_THUMBNAIL = 'thumb_large'
const KEY_TYPE = 'type'
const TYPE_JOB = 'job'
const TYPE_SCENE = 'scene'

export default class FeatureDetails extends Component {
  static propTypes = {
    className:         React.PropTypes.string,
    feature:           React.PropTypes.shape({
      id:         React.PropTypes.string,
      properties: React.PropTypes.object,
    }),
    onThumbnailLoaded: React.PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {thumbnailLoading: false, thumbnailError: null}
  }

  componentWillReceiveProps(nextProps) {
    const {feature} = nextProps
    if (feature) {
      // TODO -- show loading anim
      fetchThumbnail(feature.properties[KEY_THUMBNAIL])
        .promise
        .then(image => {
          // TODO -- fade out loader anim
          this.props.onThumbnailLoaded(image, feature.properties.geometry)
        })
        .catch(err => {
          if (err.isCancellation) {
            return
          }
          console.error('Ack!', err)
          this.setState({
            thumbnailError: err
          })
          // TODO -- swap loading anim with loaderror
        })
    } else {
      this.props.onThumbnailLoaded(null)
    }
  }

  render() {
    const {feature} = this.props
    if (!feature) {
      return <div role="nothing-selected"/>
    }
    return (
      <div className={styles.root}>
        <LoadingAnimation className={styles.loadingAnimation}/>
        <LoadFailed className={styles.loadFailed}/>

        {feature.properties[KEY_TYPE] === TYPE_JOB && (
          <JobFeatureDetails
            feature={feature}
          />
        )}

        {feature.properties[KEY_TYPE] === TYPE_SCENE && (
          <SceneFeatureDetails
            feature={feature}
          />
        )}
      </div>
    )
  }
}

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
import LoadingAnimation from './LoadingAnimation'
import {fetchThumbnail} from '../utils/fetch-thumbnail'
import errorPlaceholder from '../images/error-placeholder.png'
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
    this.state = {loadRefCount: 0}
  }

  _incrementLoading() {
    this.setState({
      loadRefCount: this.state.loadRefCount + 1
    })
  }

  _decrementLoading() {
    this.setState({
      loadRefCount: Math.max(this.state.loadRefCount - 1, 0)
    })
  }

  componentWillReceiveProps(nextProps) {
    const {feature} = nextProps
    if (feature && this.props.feature !== feature) {
      this._incrementLoading()
      this._fetchThumbnail(feature.properties[KEY_THUMBNAIL])
        .then(image => {
          this._decrementLoading()
          this._emitThumbnailLoaded(image, feature)
        })
        .catch(err => {
          this._decrementLoading()
          if (err.isCancellation) {
            return
          }
          console.error('Could not load thumbnail!', err)
          const image = generateErrorPlaceholder()
          this._emitThumbnailLoaded(image, feature)
        })
    }
  }

  render() {
    const {feature} = this.props
    if (!feature) {
      return <div role="nothing-selected"/>
    }
    return (
      <div className={`${styles.root} ${this._classForLoading}`}>
        <LoadingAnimation className={styles.loadingAnimation}/>

        {feature.properties[KEY_TYPE] === TYPE_JOB && (
          <JobFeatureDetails
            className={styles.jobDetails}
            feature={feature}
          />
        )}

        {feature.properties[KEY_TYPE] === TYPE_SCENE && (
          <SceneFeatureDetails
            className={styles.sceneDetails}
            feature={feature}
          />
        )}
      </div>
    )
  }

  get _classForLoading() {
    return this.state.loadRefCount ? styles.isLoading : ''
  }

  _emitThumbnailLoaded(image, feature) {
    setTimeout(() => this.props.onThumbnailLoaded(image, feature), 200)
  }

  _fetchThumbnail(url) {
    if (this._thumbnailPromise) {
      this._thumbnailPromise.cancel()
    }
    this._thumbnailPromise = fetchThumbnail(url)
    return this._thumbnailPromise.promise
  }
}

function generateErrorPlaceholder() {
  const placeholder = new Image()
  placeholder.src = errorPlaceholder
  return placeholder
}

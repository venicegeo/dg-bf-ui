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
import styles from './FeatureDetails.css'

import {
  TYPE_JOB,
  TYPE_SCENE,
  KEY_TYPE,
} from '../constants'

export default class FeatureDetails extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    feature:   React.PropTypes.shape({
      id:         React.PropTypes.string,
      properties: React.PropTypes.object,
    }),
  }

  render() {
    const {feature} = this.props
    if (!feature) {
      return <div role="nothing-selected"/>
    }
    return (
      <div className={styles.root}>
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
}

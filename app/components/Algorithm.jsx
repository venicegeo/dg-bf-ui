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
import styles from './Algorithm.css'

import {
  REQUIREMENT_BANDS,
  REQUIREMENT_CLOUDCOVER
} from '../constants'

export default class Algorithm extends Component {
  static propTypes = {
    algorithm:       React.PropTypes.shape({
      name:         React.PropTypes.string,
      description:  React.PropTypes.string,
      requirements: React.PropTypes.array.isRequired,
    }).isRequired,
    imageProperties: React.PropTypes.object.isRequired,
    isSubmitting:    React.PropTypes.bool.isRequired,
    onSubmit:        React.PropTypes.func
  }

  constructor() {
    super()
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  render() {
    return (
      <form className={`${styles.root} ${this._aggregatedClassNames}`} onSubmit={this._handleSubmit}>
        <h3 className={styles.name}>{this.props.algorithm.name}</h3>
        <p className={styles.description}>{this.props.algorithm.description}</p>

        <div className={styles.controls}>
          <div className={styles.compatibilityWarning}>
            <h4><i className="fa fa-warning"/> Incompatible Image Selected</h4>
            <p>The image you've selected does not meet all of this algorithm's requirements.  You can run it anyway but it may not produce the expected results.</p>
          </div>
          <button className={styles.startButton} disabled={this._canSubmit}>
            {this.props.isSubmitting ? 'Starting' : 'Run Algorithm'}
          </button>
        </div>

        <div className={styles.requirements}>
          <h4>Image Requirements</h4>
          <table>
            <tbody>
            {this.props.algorithm.requirements.map(r => (
              <tr key={r.name} className={isCompatible(r, this.props.imageProperties) ? styles.met : styles.unmet}>
                <th>{r.name}</th>
                <td>{r.description}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </form>
    )
  }

  //
  // Internals
  //

  get _aggregatedClassNames() {
    return [
      this._classForCompatibility,
      this._classForSubmitting,
    ].join(' ')
  }

  get _classForCompatibility() {
    const compatible = this.props.algorithm.requirements.every(r => isCompatible(r, this.props.imageProperties))
    return compatible ? styles.isCompatible : styles.isNotCompatible
  }

  get _classForSubmitting() {
    return this.props.isSubmitting ? styles.isSubmitting : ''
  }

  get _canSubmit() {
    return !this.props.isSubmitting
  }

  _handleSubmit(event) {
    event.preventDefault()
    if (!this._canSubmit) {
      return
    }
    this.props.onSubmit(this.props.algorithm)
  }
}

//
// Internals
//

function isCompatible(requirement, imageProperties) {
  switch (requirement.name) {
  case REQUIREMENT_BANDS:
    return requirement.literal.split(',').every(s => imageProperties.bands[s])
  case REQUIREMENT_CLOUDCOVER:
    return imageProperties.cloudCover < requirement.literal
  default:
    return false
  }
}

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
import styles from './AlgorithmProductLine.css'


export default class AlgorithmProductLine extends Component {
  static propTypes = {
    algorithm:       React.PropTypes.shape({
      name:         React.PropTypes.string,
      description:  React.PropTypes.string,
      requirements: React.PropTypes.array.isRequired,
    }).isRequired,
    isSubmitting:    React.PropTypes.bool.isRequired,
    onSubmit:        React.PropTypes.func.isRequired,
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
          <button className={styles.startButton} disabled={!this._canSubmit}>
            {this.props.isSubmitting ? 'Starting' : 'Submit'}
          </button>
        </div>

        <div className={styles.requirements}>
          <h4>Image Requirements</h4>
          <table>
            <tbody>
            {this.props.algorithm.requirements.map(r => (
              <tr key={r.name} className={styles.met}>
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
console.dir(this)
    //this.props.onSubmit(this.props.algorithm)
  }
}

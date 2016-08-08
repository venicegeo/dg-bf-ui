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
import AlgorithmProductLine from './AlgorithmProductLine'
import styles from './AlgorithmListProductLine.css'

export default class AlgorithmListProductLine extends Component {
  static propTypes = {
    algorithms:      React.PropTypes.array.isRequired,
    className:       React.PropTypes.string,
    isSubmitting:    React.PropTypes.bool.isRequired,
    onSubmit:        React.PropTypes.func.isRequired,
  }

  render() {
    return (
      <div className={styles.root}>
        <h2>Select Algorithm</h2>
        <ul>
          {this.props.algorithms.map(algorithm => (
            <li key={algorithm.id}>
              <AlgorithmProductLine
                algorithm={algorithm}
                isSubmitting={this.props.isSubmitting}
                onSubmit={this.props.onSubmit}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

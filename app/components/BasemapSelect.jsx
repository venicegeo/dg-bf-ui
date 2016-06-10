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
import styles from './BasemapSelect.css'

export default class BasemapSelect extends Component {
  static propTypes = {
    basemaps: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    className: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  }

  constructor() {
    super()
    this.state = {index: 0, isOpen: false}
    this._handleToggleOpen = this._handleToggleOpen.bind(this)
  }

  render() {
    const {index, isOpen} = this.state
    const {basemaps, className} = this.props
    const current = basemaps[index]
    return (
      <div className={`${styles.root} ${className || ''} ${isOpen ? styles.isOpen : ''}`}>
        <div className={styles.button} onClick={this._handleToggleOpen}>
          <label>
            <svg viewBox="0 0 40 33">
              <polygon points="36.4644661 17.3228873 40 19.5276993 20 32 0 19.5276993 3.53553391 17.3228873 20 27.5903758 36.4644661 17.3228873"/>
              <polygon points="40 12.4723007 20 24.9446013 0 12.4723007 20 0"/>
            </svg>
            {current}
          </label>
          <span><i className="fa fa-caret-down"/></span>
        </div>
        <ul className={styles.options}>
          {basemaps.map((basemap, i) => (
            <li key={i}
                className={index === i ? styles.active : ''}
                onClick={() => this._handleChange(i)}>{basemap}</li>
          ))}
        </ul>
      </div>
    )
  }

  _handleChange(index) {
    this.props.onChange(index)
    this.setState({index, isOpen: false})
  }

  _handleToggleOpen() {
    this.setState({isOpen: !this.state.isOpen})
  }
}

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
import styles from './NewProductLineDetails.css'

export default class NewProductLineDetails extends Component {
  static propTypes = {
    className:    React.PropTypes.string,
    name:         React.PropTypes.string.isRequired,
    onNameChange: React.PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this._emitNameChange = this._emitNameChange.bind(this)
  }

  componentDidMount() {
    this.refs.name.value = this.props.name

    const date = new Date(new Date() + 1)
    this.refs.dateToBegin.value = new Date(new Date() + 1).toISOString().split('T')[0]
    this.refs.dateToEnd.value = new Date(date.setDate(date.getDate() + 30)).toISOString().split('T')[0]
  }

  componentWillReceiveProps(nextProps) {
    if (this.refs.name.value !== nextProps.name) {
      this.refs.name.value = nextProps.name
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <h2>Product Line Details</h2>
        <h3>Name</h3>
        <label className={styles.field}>
          <input ref="name" onChange={this._emitNameChange}/>
        </label>

        <h3>Scheduling</h3>
        <label className={styles.captureDateToBegin}>
          <span>Date To Begin</span>
          <input ref="dateToBegin" type="date" onChange={this._emitDateChange} />
        </label>
        <label className={styles.captureDateToEnd}>
          <span>Date To End</span>
          <input ref="dateToEnd" type="date" onChange={this._emitDateChange} />
        </label>
      </div>
    )
  }

  _emitNameChange() {
    this.props.onNameChange(this.refs.name.value)
  }
}

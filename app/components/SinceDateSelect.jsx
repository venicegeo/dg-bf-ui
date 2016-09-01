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

const styles = require('./SinceDateSelect.css')

import React from 'react'

export class SinceDateSelect extends React.Component {
  static propTypes = {
    options: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    className: React.PropTypes.string,
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {isOpen: false}
    this._handleToggleOpen = this._handleToggleOpen.bind(this)
    this._handleExternalClick = this._handleExternalClick.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isOpen !== prevState.isOpen) {
      if (this.state.isOpen) {
        this._attachClickInterceptor()
      }
      else {
        this._detachClickInterceptor()
      }
    }
  }

  componentWillUnmount() {
    this._detachClickInterceptor()
  }

  render() {
    const {options, className, value} = this.props
    const current = options.find(o => o.value === value)
    return (
      <div className={`${styles.root} ${className || ''} ${this.state.isOpen ? styles.isOpen : ''}`}>
        <div className={styles.button} onClick={this._handleToggleOpen}>
          {current.label} <i className="fa fa-caret-down"/>
        </div>
        <ul className={styles.options}>
          {options.map(option => (
            <li key={option.value}
                className={current === option ? styles.active : ''}
                onClick={() => this._handleChange(option.value)}>{option.label}</li>
          ))}
        </ul>
      </div>
    )
  }

  _attachClickInterceptor() {
    document.addEventListener('click', this._handleExternalClick)
  }

  _detachClickInterceptor() {
    document.removeEventListener('click', this._handleExternalClick)
  }

  _handleChange(index) {
    this.props.onChange(index)
    this.setState({index, isOpen: false})
  }

  _handleExternalClick() {
    this.setState({ isOpen: false })
    this._detachClickInterceptor()
  }

  _handleToggleOpen() {
    this.setState({isOpen: !this.state.isOpen})
  }
}

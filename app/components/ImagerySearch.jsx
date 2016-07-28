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
import LoadingAnimation from './LoadingAnimation'
import StaticMinimap from './StaticMinimap'
import styles from './ImagerySearch.css'
import moment from 'moment'

export default class ImagerySearch extends Component {
  static propTypes = {
    bbox:               React.PropTypes.array.isRequired,
    catalogApiKey:      React.PropTypes.string,
    cloudCover:         React.PropTypes.number.isRequired,
    dateFrom:           React.PropTypes.string.isRequired,
    dateTo:             React.PropTypes.string.isRequired,
    error:              React.PropTypes.object,
    filter:             React.PropTypes.string,
    filters:            React.PropTypes.arrayOf(React.PropTypes.shape({
      id:   React.PropTypes.string,
      name: React.PropTypes.string,
    })).isRequired,
    isSearching:        React.PropTypes.bool.isRequired,
    onApiKeyChange:     React.PropTypes.func.isRequired,
    onClearBbox:        React.PropTypes.func.isRequired,
    onCloudCoverChange: React.PropTypes.func.isRequired,
    onDateChange:       React.PropTypes.func.isRequired,
    onFilterChange:     React.PropTypes.func.isRequired,
    onSubmit:           React.PropTypes.func.isRequired
  }

  constructor() {
    super()
    this._emitApiKeyChange = this._emitApiKeyChange.bind(this)
    this._emitCloudCoverChange = this._emitCloudCoverChange.bind(this)
    this._emitDateChange = this._emitDateChange.bind(this)
    this._emitFilterChange = this._emitFilterChange.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  componentDidMount() {
    this.refs.dateFrom.value = this.props.dateFrom
    this.refs.dateTo.value = moment().format('YYYY-MM-DD')
    this.refs.apiKey.value = this.props.catalogApiKey || ''
    this.refs.cloudCover.value = this.props.cloudCover || ''
    this.refs.filter.value = this.props.filter || ''
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filter !== this.props.filter) {
      this.refs.filter.value = this.props.filter || ''
    }
  }

  render() {
    const {error, bbox, cloudCover, isSearching} = this.props
    return (
      <form className={`${styles.root} ${isSearching ? styles.isSearching : ''}`} onSubmit={this._handleSubmit}>
        <h2>Search for Imagery</h2>
        <div className={styles.minimap}>
          <StaticMinimap bbox={bbox}/>
          <div className={styles.clearBbox} onClick={this.props.onClearBbox}>
            <i className="fa fa-times-circle"/> Clear
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <h4><i className="fa fa-warning"/> Search failed</h4>
            <p>Could not search the image catalog because of an error.</p>
            <pre>{error.stack}</pre>
          </div>
        )}
        <h3>Catalog</h3>
        <label className={styles.field}>
          <span>Provider</span>
          <select disabled={true}>
            <option>Planet Labs (LANDSAT)</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>API Key</span>
          <input ref="apiKey" type="password" disabled={isSearching} onChange={this._emitApiKeyChange} />
        </label>

        <h3>Date of Capture</h3>
        <label className={styles.field}>
          <span>From</span>
          <input ref="dateFrom" type="date" disabled={isSearching} onChange={this._emitDateChange} />
        </label>
        <label className={styles.field}>
          <span>To</span>
          <input ref="dateTo" type="date" disabled={isSearching} onChange={this._emitDateChange} />
        </label>

        <h3>Filters</h3>
        <label className={styles.cloudCover}>
          <span>Cloud Cover</span>
          <input ref="cloudCover" type="range" min="0" max="100" onChange={this._emitCloudCoverChange}/>
          <span className={styles.value}>{cloudCover > 0 && '< '}{cloudCover}%</span>
        </label>
        <label className={styles.field}>
          <span>Spatial Filter</span>
          <select ref="filter" onChange={this._emitFilterChange}>
            <option value="">None</option>
            {this.props.filters.map(({id, name}) => (
              <option key={id} value={id}>{titleCase(name)}</option>
            ))}
          </select>
        </label>

        <div className={styles.controls}>
          <button disabled={!this._canSubmit}>Search for imagery</button>
        </div>

        <div className={styles.loadingMask}>
          <LoadingAnimation className={styles.loadingAnimation}/>
        </div>
      </form>
    )
  }

  //
  // Internals
  //

  get _canSubmit() {
    return this.props.isSearching === false
        && this.props.catalogApiKey
        && this.props.dateFrom
        && this.props.dateTo
  }

  _emitApiKeyChange() {
    this.props.onApiKeyChange(this.refs.apiKey.value)
  }

  _emitCloudCoverChange() {
    this.props.onCloudCoverChange(parseInt(this.refs.cloudCover.value, 10))
  }

  _emitDateChange() {
    const {dateFrom, dateTo} = this.refs
    this.props.onDateChange(dateFrom.value, dateTo.value)
  }

  _emitFilterChange() {
    this.props.onFilterChange(this.refs.filter.value || null)
  }

  _handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSubmit()
  }
}

//
// Helpers
//

function titleCase(s) {
  return s.replace(/((?:^|\s)[a-z])/g, c => c.toUpperCase())
}

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

const styles: any = require('./ImagerySearch.css')

import * as React from 'react'
import LoadingAnimation from './LoadingAnimation'
import StaticMinimap from './StaticMinimap'

interface Props {
  bbox
  catalogApiKey
  cloudCover
  dateFrom
  dateTo
  error
  filter
  filters
  isSearching
  onApiKeyChange(value: string)
  onClearBbox()
  onCloudCoverChange(value: number)
  onDateChange(fromValue: string, toValue: string)
  onFilterChange(value: string)
  onSubmit()
}

export default class ImagerySearch extends React.Component<Props, {}> {
  refs: any

  constructor() {
    super()
    this.emitApiKeyChange     = this.emitApiKeyChange.bind(this)
    this.emitCloudCoverChange = this.emitCloudCoverChange.bind(this)
    this.emitDateChange       = this.emitDateChange.bind(this)
    this.emitFilterChange     = this.emitFilterChange.bind(this)
    this.handleSubmit         = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    this.refs.dateFrom.value = this.props.dateFrom
    this.refs.dateTo.value = this.props.dateTo
    this.refs.apiKey.value = this.props.catalogApiKey || ''
    this.refs.cloudCover.value = this.props.cloudCover || '0'
    this.refs.filter.value = this.props.filter || ''
  }

  componentDidUpdate(prevProps) {
    if (prevProps.catalogApiKey !== this.props.catalogApiKey) {
      this.refs.apiKey.value = this.props.catalogApiKey
    }
    if (prevProps.cloudCover !== this.props.cloudCover) {
      this.refs.cloudCover.value = this.props.cloudCover
    }
    if (prevProps.dateFrom !== this.props.dateFrom) {
      this.refs.dateFrom.value = this.props.dateFrom
    }
    if (prevProps.dateTo !== this.props.dateTo) {
      this.refs.dateTo.value = this.props.dateTo
    }
    if (prevProps.filter !== this.props.filter) {
      this.refs.filter.value = this.props.filter || ''
    }
  }

  render() {
    const {error, bbox, cloudCover, isSearching} = this.props
    return (
      <form className={`${styles.root} ${isSearching ? styles.isSearching : ''}`} onSubmit={this.handleSubmit}>
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
        <label className={styles.provider}>
          <span>Provider</span>
          <select disabled={true}>
            <option>Planet Labs (LANDSAT)</option>
          </select>
        </label>
        <label className={styles.catalogApiKey}>
          <span>API Key</span>
          <input ref="apiKey" type="password" disabled={isSearching} onChange={this.emitApiKeyChange} />
        </label>

        <h3>Date of Capture</h3>
        <label className={styles.captureDateFrom}>
          <span>From</span>
          <input ref="dateFrom" type="date" disabled={isSearching} onChange={this.emitDateChange} />
        </label>
        <label className={styles.captureDateTo}>
          <span>To</span>
          <input ref="dateTo" type="date" disabled={isSearching} onChange={this.emitDateChange} />
        </label>

        <h3>Filters</h3>
        <label className={styles.cloudCover}>
          <span>Cloud Cover</span>
          <input ref="cloudCover" type="range" min="0" max="100" onChange={this.emitCloudCoverChange}/>
          <span className={styles.value}>{cloudCover > 0 && '< '}{cloudCover}%</span>
        </label>
        <label className={styles.spatialFilter}>
          <span>Spatial Filter</span>
          <select ref="filter" onChange={this.emitFilterChange}>
            <option value="">None</option>
            {this.props.filters.map(({id, name}) => (
              <option key={id} value={id}>{titleCase(name)}</option>
            ))}
          </select>
        </label>

        <div className={styles.controls}>
          <button type="submit" disabled={!this.canSubmit}>Search for imagery</button>
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

  private get canSubmit() {
    return this.props.isSearching === false
        && this.props.catalogApiKey
        && this.props.dateFrom
        && this.props.dateTo
  }

  private emitApiKeyChange() {
    this.props.onApiKeyChange(this.refs.apiKey.value)
  }

  private emitCloudCoverChange() {
    this.props.onCloudCoverChange(parseInt(this.refs.cloudCover.value, 10))
  }

  private emitDateChange() {
    const {dateFrom, dateTo} = this.refs
    this.props.onDateChange(dateFrom.value, dateTo.value)
  }

  private emitFilterChange() {
    this.props.onFilterChange(this.refs.filter.value || null)
  }

  private handleSubmit(event) {
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

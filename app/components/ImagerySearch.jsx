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
import CatalogSearchCriteria from './CatalogSearchCriteria'
import LoadingAnimation from './LoadingAnimation'
import styles from './ImagerySearch.css'

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
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  render() {
    return (
      <form className={`${styles.root} ${this.props.isSearching ? styles.isSearching : ''}`} onSubmit={this._handleSubmit}>
        <h2>Source Imagery</h2>

        <CatalogSearchCriteria
          apiKey={this.props.catalogApiKey}
          bbox={this.props.bbox}
          cloudCover={this.props.cloudCover}
          dateFrom={this.props.dateFrom}
          dateTo={this.props.dateTo}
          filter={this.props.filter}
          filters={this.props.filters}
          disabled={this.props.isSearching}
          onApiKeyChange={this.props.onApiKeyChange}
          onClearBbox={this.props.onClearBbox}
          onCloudCoverChange={this.props.onCloudCoverChange}
          onDateChange={this.props.onDateChange}
          onFilterChange={this.props.onFilterChange}
          errorElement={this.props.error && (
            <div className={styles.errorMessage}>
              <h4><i className="fa fa-warning"/> Search failed</h4>
              <p>Could not search the image catalog because of an error.</p>
              <pre>{this.props.error.stack}</pre>
            </div>
          )}
        />

        <div className={styles.controls}>
          <button type="submit" disabled={!this._canSubmit}>Search for imagery</button>
        </div>

        {this.props.isSearching && (
          <div className={styles.loadingMask}>
            <LoadingAnimation className={styles.loadingAnimation}/>
          </div>
        )}
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

  _handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSubmit()
  }
}

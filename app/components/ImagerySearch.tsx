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
import {CatalogSearchCriteria} from './CatalogSearchCriteria'
import {LoadingAnimation} from './LoadingAnimation'

interface Props {
  bbox: number[]
  catalogApiKey: string
  cloudCover: number
  dateFrom: string
  dateTo: string
  error?: any
  filter: string
  filters: {id: string, name: string}[]
  isSearching: boolean
  onApiKeyChange(value: string)
  onClearBbox()
  onCloudCoverChange(value: number)
  onDateChange(fromValue: string, toValue: string)
  onFilterChange(value: string)
  onSubmit()
}

export class ImagerySearch extends React.Component<Props, {}> {
  constructor() {
    super()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  render() {
    return (
      <form className={`${styles.root} ${this.props.isSearching ? styles.isSearching : ''}`} onSubmit={this.handleSubmit}>
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
          <button type="submit" disabled={!this.canSubmit}>Search for imagery</button>
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

  private get canSubmit() {
    return this.props.isSearching === false
        && this.props.catalogApiKey
        && this.props.dateFrom
        && this.props.dateTo
  }

  private handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSubmit()
  }
}

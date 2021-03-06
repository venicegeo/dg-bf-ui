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
import * as moment from 'moment'
import {AxiosError} from 'axios'
import {CatalogSearchCriteria} from './CatalogSearchCriteria'
import {LoadingAnimation} from './LoadingAnimation'

interface Props {
  bbox: number[]
  catalogApiKey: string
  cloudCover: number
  dateFrom: string
  dateTo: string
  error?: any
  isSearching: boolean
  source: string
  onApiKeyChange(value: string)
  onClearBbox()
  onCloudCoverChange(value: number)
  onDateChange(fromValue: string, toValue: string)
  onSourceChange(source: string)
  onSubmit()
}

export class ImagerySearch extends React.Component<Props, {}> {
  constructor() {
    super()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  render() {
    return (
      <form className={styles.root} onSubmit={this.handleSubmit}>
        <h2>Source Imagery</h2>

        <CatalogSearchCriteria
          apiKey={this.props.catalogApiKey}
          bbox={this.props.bbox}
          cloudCover={this.props.cloudCover}
          dateFrom={this.props.dateFrom}
          dateTo={this.props.dateTo}
          disabled={this.props.isSearching}
          source={this.props.source}
          onApiKeyChange={this.props.onApiKeyChange}
          onClearBbox={this.props.onClearBbox}
          onCloudCoverChange={this.props.onCloudCoverChange}
          onDateChange={this.props.onDateChange}
          onSourceChange={this.props.onSourceChange}
          errorElement={this.renderErrorElement()}
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

  private renderErrorElement() {
    const error: Error = this.props.error
    if (!error) {
      return  // Nothing to do
    }

    let heading, details, stacktrace

    stacktrace = error.toString()

    const {response} = error as AxiosError
    switch (response && response.status) {
      case 401:
        heading = 'Unauthorized'
        details = 'Your credentials were rejected by the data source.  Please contact the Beachfront team for technical support.'
        break
      case 400:
        heading = 'Catalog did not understand request'
        details = 'Please contact the Beachfront team for technical support.'
        break
      case 404:
        heading = 'Catalog did not understand request'
        details = 'Please contact the Beachfront team for technical support.'
        break
      case 500:
        heading = 'Catalog error'
        details = 'The Beachfront Catalog has experienced an error.  If this persists, please contact the Beachfront team for technical support.'
        break
      case 502:
      case 503:
        heading = 'Cannot communicate with Catalog'
        details = 'Unable to communicate with the Beachfront Catalog.  If this persists, please contact the Beachfront team for technical support.'
        break
      default:
        heading = 'Search failed'
        details = 'An unknown error has occurred. Please contact the Beachfront team for technical support.'
        stacktrace = error.stack
        break
    }

    return (
      <div className={styles.errorMessage}>
        <h4><i className="fa fa-warning"/> {heading}</h4>
        <p>{details}</p>
        <pre>{stacktrace}</pre>
      </div>
    )
  }

  //
  // Internals
  //

  private dateValidation() {
      return moment(this.props.dateFrom).isSameOrBefore(this.props.dateTo)
  }

  private get canSubmit() {
    return this.props.isSearching === false
        && this.props.catalogApiKey
        && this.dateValidation()
  }

  private handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSubmit()
  }
}

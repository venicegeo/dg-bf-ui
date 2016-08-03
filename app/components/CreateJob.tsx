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

const styles: any = require('./CreateJob.css')

import * as React from 'react'
import {connect} from 'react-redux'
import AlgorithmList from './AlgorithmList'
import ImagerySearch from './ImagerySearch'
import NewJobDetails from './NewJobDetails'
import {
  createJob,
  changeJobName,
  resetJobName,
  searchCatalog,
  updateCatalogApiKey,
  updateSearchBbox,
  updateSearchCloudCover,
  updateSearchDates,
  updateSearchFilter,
} from '../actions'

interface Props {
  algorithms: beachfront.Algorithm[]
  bbox: number[]
  catalogApiKey: string
  cloudCover: number
  dateFrom: string
  dateTo: string
  filter: string
  filters: {id: string, name: string}[]
  isCreating: boolean
  isSearching: boolean
  jobName: string
  searchError: any
  selectedImage: beachfront.Scene
  onCatalogApiKeyChange(apiKey: string)
  onClearBbox()
  onJobSubmit(catalogApiKey: string, jobName: string, algorithm: beachfront.Algorithm, selectedImage: beachfront.Scene)
  onNameChange()
  onResetName()
  onSearchCloudCoverChange()
  onSearchFilterChange()
  onSearchDateChange()
  onSearchSubmit()
}

export class CreateJob extends React.Component<Props, {}> {
  static contextTypes: React.ValidationMap<any> = {
    router: React.PropTypes.object,
  }

  context: any

  constructor() {
    super()
    this._emitJobSubmit = this._emitJobSubmit.bind(this)
  }

  componentDidMount() {
    this.props.onResetName()
  }

  render() {
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Job</h1>
        </header>
        <ul>
          {this.props.bbox && (
            <li className={styles.search}>
              <ImagerySearch
                bbox={this.props.bbox}
                catalogApiKey={this.props.catalogApiKey}
                cloudCover={this.props.cloudCover}
                dateFrom={this.props.dateFrom}
                dateTo={this.props.dateTo}
                error={this.props.searchError}
                filter={this.props.filter}
                filters={this.props.filters}
                isSearching={this.props.isSearching}
                onApiKeyChange={this.props.onCatalogApiKeyChange}
                onClearBbox={this.props.onClearBbox}
                onCloudCoverChange={this.props.onSearchCloudCoverChange}
                onDateChange={this.props.onSearchDateChange}
                onFilterChange={this.props.onSearchFilterChange}
                onSubmit={this.props.onSearchSubmit}
              />
            </li>
          )}
          {this.props.bbox && this.props.selectedImage && (
            <li className={styles.details}>
              <NewJobDetails
                name={this.props.jobName}
                onNameChange={this.props.onNameChange}
              />
            </li>
          )}
          {this.props.bbox && this.props.selectedImage && (
            <li className={styles.algorithms}>
              <AlgorithmList
                algorithms={this.props.algorithms}
                imageProperties={this.props.selectedImage.properties}
                isSubmitting={this.props.isCreating}
                onSubmit={this._emitJobSubmit}
              />
            </li>
          )}

          {!this.props.bbox && (
            <li className={styles.placeholder}>
              <h3>Draw bounding box to search for imagery</h3>
              <p>or</p>
              <button className={styles.uploadButton}>
                <i className="fa fa-upload"/> Upload my own image
              </button>
            </li>
          )}
        </ul>
      </div>
    )
  }

  _emitJobSubmit(algorithm) {
    const {jobName, selectedImage, catalogApiKey} = this.props
    this.props.onJobSubmit(catalogApiKey, jobName, algorithm, selectedImage)
      .then(jobId => {
        this.context.router.push({
          pathname: '/jobs',
          query: {
            jobId,
          },
        })
      })
  }
}

export default connect(state => ({
  algorithms:    state.algorithms.records,
  bbox:          state.search.bbox,
  catalogApiKey: state.catalog.apiKey,
  cloudCover:    state.search.cloudCover,
  dateFrom:      state.search.dateFrom,
  dateTo:        state.search.dateTo,
  filter:        state.search.filter,
  filters:       state.catalog.filters,
  isCreating:    state.jobs.creating,
  isSearching:   state.search.searching,
  jobName:       state.draftJob.name,
  searchError:   state.search.error,
  selectedImage: state.draftJob.image,
}), dispatch => ({
  onJobSubmit:              (apiKey, name, algorithm, image) => dispatch(createJob(apiKey, name, algorithm, image)),
  onCatalogApiKeyChange:    (apiKey) => dispatch(updateCatalogApiKey(apiKey)),
  onClearBbox:              () => dispatch(updateSearchBbox(null)),
  onNameChange:             (name) => dispatch(changeJobName(name)),
  onResetName:              () => dispatch(resetJobName()),
  onSearchCloudCoverChange: (cloudCover) => dispatch(updateSearchCloudCover(cloudCover)),
  onSearchFilterChange:     (filter) => dispatch(updateSearchFilter(filter)),
  onSearchDateChange:       (dateFrom, dateTo) => dispatch(updateSearchDates(dateFrom, dateTo)),
  onSearchSubmit:           () => dispatch(searchCatalog()),
}))(CreateJob)

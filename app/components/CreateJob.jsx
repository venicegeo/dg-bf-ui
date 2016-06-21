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
import {connect} from 'react-redux'
import AlgorithmList from './AlgorithmList'
import ImagerySearch from './ImagerySearch'
import NewJobDetails from './NewJobDetails'
import styles from './CreateJob.css'
import {
  createJob,
  searchCatalog,
  updateCatalogApiKey,
  updateSearchBbox,
  updateSearchDates
} from '../actions'

class CreateJob extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    algorithms:    React.PropTypes.array.isRequired,
    bbox:          React.PropTypes.arrayOf(React.PropTypes.number),
    catalogApiKey: React.PropTypes.string,
    dateFrom:      React.PropTypes.string.isRequired,
    dateTo:        React.PropTypes.string.isRequired,
    dispatch:      React.PropTypes.func.isRequired,
    error:         React.PropTypes.object,
    isSearching:   React.PropTypes.bool.isRequired,
    jobName:       React.PropTypes.string,
    location:      React.PropTypes.object.isRequired,
    selectedImage: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {name: null}
    this._handleJobSubmit = this._handleJobSubmit.bind(this)
    this._handleCatalogApiKeyChange = this._handleCatalogApiKeyChange.bind(this)
    this._handleClearBbox = this._handleClearBbox.bind(this)
    this._handleNameChange = this._handleNameChange.bind(this)
    this._handleSearchSubmit = this._handleSearchSubmit.bind(this)
    this._handleSearchDateChange = this._handleSearchDateChange.bind(this)
  }

  render() {
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Job</h1>
        </header>
        <ul>
          {this.props.bbox && (
            <li className={styles.imagery}>
              <ImagerySearch bbox={this.props.bbox}
                             catalogApiKey={this.props.catalogApiKey}
                             dateFrom={this.props.dateFrom}
                             dateTo={this.props.dateTo}
                             error={this.props.error}
                             isSearching={this.props.isSearching}
                             onApiKeyChange={this._handleCatalogApiKeyChange}
                             onClearBbox={this._handleClearBbox}
                             onDateChange={this._handleSearchDateChange}
                             onSubmit={this._handleSearchSubmit}/>
            </li>
          )}
          {this.props.bbox && this.props.selectedImage && (
            <li className={styles.details}>
              <NewJobDetails onNameChange={this._handleNameChange}/>
            </li>
          )}
          {this.props.bbox && this.props.selectedImage && (
            <li className={styles.algorithms}>
              <AlgorithmList algorithms={this.props.algorithms}
                             imageProperties={this.props.selectedImage.properties}
                             onSubmit={this._handleJobSubmit}/>
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

  //
  // Internals
  //

  _handleCatalogApiKeyChange(apiKey) {
    this.props.dispatch(updateCatalogApiKey(apiKey))
  }

  _handleClearBbox() {
    this.props.dispatch(updateSearchBbox())
  }

  _handleJobSubmit(algorithm) {
    const {selectedImage, catalogApiKey} = this.props
    const {name} = this.state
    this.props.dispatch(createJob(catalogApiKey, name, algorithm, selectedImage))
      .then(jobId => {
        this.context.router.push({
          pathname: '/jobs',
          query: {
            jobId
          }
        })
      })
  }

  _handleNameChange(name) {
    this.setState({name})
  }

  _handleSearchDateChange(dateFrom, dateTo) {
    this.props.dispatch(updateSearchDates(dateFrom, dateTo))
  }

  _handleSearchSubmit() {
    this.props.dispatch(searchCatalog())
  }
}

export default connect(state => ({
  algorithms:    state.algorithms.records,
  bbox:          state.search.bbox,
  catalogApiKey: state.catalog.apiKey,
  dateFrom:      state.search.dateFrom,
  dateTo:        state.search.dateTo,
  error:         state.search.error,
  isSearching:   state.search.searching,
  jobName:       state.draftJob.name,
  selectedImage: state.draftJob.image,
}))(CreateJob)

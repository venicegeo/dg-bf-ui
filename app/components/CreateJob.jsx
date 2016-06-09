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
import {deserialize} from '../utils/bbox'
import {createJob, searchImageCatalog} from '../actions'
import styles from './CreateJob.css'

function selector(state) {
  return {
    algorithms: state.algorithms.records,
    imagery: state.imagery
  }
}

class CreateJob extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    algorithms: React.PropTypes.array.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    imagery: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this.state = {name: null, catalogApiKey: null, dateFrom: null, dateTo: null}
    this._handleJobSubmit = this._handleJobSubmit.bind(this)
    this._handleNameChange = this._handleNameChange.bind(this)
    this._handleClearBbox = this._handleClearBbox.bind(this)
    this._handleSearchSubmit = this._handleSearchSubmit.bind(this)
    this._handleSearchFormChange = this._handleSearchFormChange.bind(this)
  }

  render() {
    const bbox = deserialize(this.props.params.bbox)
    const selectedImage = this.props.imagery.selection
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Job</h1>
        </header>
        <ul>
          {bbox && <li className={styles.imagery}>
            <ImagerySearch bbox={bbox}
                           error={this.props.imagery.error}
                           isSearching={this.props.imagery.searching}
                           onChange={this._handleSearchFormChange}
                           onClearBbox={this._handleClearBbox}
                           onSubmit={this._handleSearchSubmit}/>
          </li>}

          {bbox && selectedImage && <li className={styles.details}>
            <NewJobDetails onNameChange={this._handleNameChange}/>
          </li>}

          {bbox && selectedImage && <li className={styles.algorithms}>
            <AlgorithmList algorithms={this.props.algorithms}
                           imageProperties={selectedImage.properties}
                           onSubmit={this._handleJobSubmit}/>
          </li>}

          {!bbox && <li className={styles.placeholder}>
            <h3>Draw bounding box to search for imagery</h3>
            <p>or</p>
            <button className={styles.uploadButton}>
              <i className="fa fa-upload"/> Upload my own image
            </button>
          </li>}
        </ul>
      </div>
    )
  }

  //
  // Internals
  //

  _handleJobSubmit(algorithm) {
    const {catalogApiKey, name} = this.state
    this.props.dispatch(createJob(catalogApiKey, name, algorithm, this.props.imagery.selection))
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

  _handleClearBbox() {
    this.context.router.push({...this.props.location, pathname: '/create-job'})
  }

  _handleSearchFormChange(catalogApiKey, dateFrom, dateTo) {
    this.setState({catalogApiKey, dateFrom, dateTo})
  }

  _handleSearchSubmit() {
    const {catalogApiKey, dateFrom, dateTo} = this.state
    const {bbox} = this.props.params
    if (catalogApiKey && dateFrom) {
      this.props.dispatch(searchImageCatalog(catalogApiKey, bbox, dateFrom, dateTo))
    }
  }
}

export default connect(selector)(CreateJob)

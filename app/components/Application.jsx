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
import Navigation from './Navigation'
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY} from './PrimaryMap'
import styles from './Application.css'
import {
  clearImagery,
  changeLoadedResults,
  discoverCatalogIfNeeded,
  discoverExecutorIfNeeded,
  discoverGeoserverIfNeeded,
  loadDetections,
  searchCatalog,
  selectImage,
  startAlgorithmsWorkerIfNeeded,
  startJobsWorkerIfNeeded,
  unloadDetections,
  updateSearchBbox
} from '../actions'

class Application extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    bbox:            React.PropTypes.arrayOf(React.PropTypes.number),
    catalogApiKey:   React.PropTypes.string,
    children:        React.PropTypes.element,
    detections:      React.PropTypes.array.isRequired,
    dispatch:        React.PropTypes.func.isRequired,
    geoserverUrl:    React.PropTypes.string,
    imagery:         React.PropTypes.object,
    isLoggedIn:      React.PropTypes.bool.isRequired,
    isSearching:     React.PropTypes.bool.isRequired,
    jobs:            React.PropTypes.array.isRequired,
    location:        React.PropTypes.object.isRequired,
    selectedFeature: React.PropTypes.object,
    workers:         React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this._handleAnchorChange = this._handleAnchorChange.bind(this)
    this._handleBoundingBoxChange = this._handleBoundingBoxChange.bind(this)
    this._handleSearchPageChange = this._handleSearchPageChange.bind(this)
    this._handleSelectImage = this._handleSelectImage.bind(this)
    this._handleSelectJob = this._handleSelectJob.bind(this)
  }

  componentDidMount() {
    const {dispatch, location, isLoggedIn} = this.props
    if (isLoggedIn) {
      dispatch(discoverCatalogIfNeeded())
      dispatch(discoverExecutorIfNeeded())
      dispatch(discoverGeoserverIfNeeded())
      dispatch(startAlgorithmsWorkerIfNeeded())
      dispatch(startJobsWorkerIfNeeded())
      if (location.query.jobId) {
        dispatch(loadDetections(asArray(location.query.jobId)))
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch} = this.props
    if (!this.props.isLoggedIn && nextProps.isLoggedIn) {
      dispatch(discoverCatalogIfNeeded())
      dispatch(discoverExecutorIfNeeded())
      dispatch(discoverGeoserverIfNeeded())
      dispatch(startAlgorithmsWorkerIfNeeded())
      dispatch(startJobsWorkerIfNeeded())
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      dispatch(updateSearchBbox(null))
    }
    if (nextProps.bbox !== this.props.bbox) {
      dispatch(clearImagery())
    }
    if (!isSameQuery(nextProps.location.query.jobId, this.props.location.query.jobId)) {
      if (nextProps.location.query.jobId) {
        dispatch(loadDetections(asArray(nextProps.location.query.jobId)))
      }
      else {
        dispatch(unloadDetections())
      }
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap
          geoserverUrl={this.props.geoserverUrl}
          jobs={this.props.jobs}
          detections={this.props.detections}
          imagery={this.props.imagery}
          isSearching={this.props.isSearching}
          anchor={this.props.location.hash}
          catalogApiKey={this.props.catalogApiKey}
          bbox={this.props.bbox}
          mode={this._mapMode}
          selectedFeature={this.props.selectedFeature}
          onAnchorChange={this._handleAnchorChange}
          onBoundingBoxChange={this._handleBoundingBoxChange}
          onSearchPageChange={this._handleSearchPageChange}
          onSelectImage={this._handleSelectImage}
          onSelectJob={this._handleSelectJob}
        />
        {this.props.children}
      </div>
    )
  }

  //
  // Internal API
  //

  get _mapMode() {
    if (this.props.location.pathname === 'create-job') {
      return (this.props.bbox && this.props.imagery) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
    }
    return MODE_NORMAL
  }

  _handleAnchorChange(anchor) {
    if (this.props.location.hash !== anchor) {
      this.context.router.replace({
        ...this.props.location,
        hash: anchor
      })
    }
  }

  _handleBoundingBoxChange(bbox) {
    this.props.dispatch(updateSearchBbox(bbox))
  }

  _handleSelectImage(feature) {
    this.props.dispatch(selectImage(feature))
  }

  _handleSelectJob(jobId) {
    this.context.router.push({
      ...this.props.location,
      query: {
        jobId: jobId || undefined
      }
    })
  }

  _handleSearchPageChange(paging) {
    this.props.dispatch(searchCatalog(paging.startIndex, paging.count))
  }
}

export default connect((state, ownProps) => ({
  bbox:            state.search.bbox,
  catalogApiKey:   state.catalog.apiKey,
  detections:      state.detections,
  geoserverUrl:    state.geoserver.url,
  imagery:         state.imagery,
  jobs:            state.jobs.records,
  isLoggedIn:      !!state.authentication.token,
  isSearching:     state.search.searching,
  selectedFeature: state.draftJob.image || state.jobs.records.find(j => j.id === ownProps.location.query.jobId) || null,
  workers:         state.workers,
}))(Application)

//
// Internals
//

function asArray(value) {
  if (value) {
    return [].concat(value)
  }
}

function isSameQuery(a, b) {
  return String(a) === String(b)
}

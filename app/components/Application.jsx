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
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY, MODE_PRODUCT_LINES} from './PrimaryMap'
import styles from './Application.css'
import {
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  importJob,
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  clearImagery,
  clearSelectedImage,
  discoverCatalogIfNeeded,
  discoverExecutorIfNeeded,
  discoverGeoserverIfNeeded,
  changeLoadedDetections,
  searchCatalog,
  selectImage,
  startAlgorithmsWorkerIfNeeded,
  startJobsWorkerIfNeeded,
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
    productLines:    React.PropTypes.array.isRequired,
    productLineJobs: React.PropTypes.object.isRequired,
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
      dispatch(changeLoadedDetections(enumerate(location.query.jobId)))
      // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
      for (const jobId of enumerate(this.props.location.query.jobId)) {
        if (!this.props.jobs.find(j => j.id === jobId)) {
          dispatch(importJob(jobId))
            .catch(console.log.bind(console))
        }
      }
      // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    }
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch} = this.props
    if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
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
    dispatch(changeLoadedDetections(enumerate(nextProps.location.query.jobId)))
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap
          geoserverUrl={this.props.geoserverUrl}
          frames={this._frames}
          detections={this._detections}
          imagery={this.props.imagery}
          isSearching={this.props.isSearching}
          anchor={this.props.location.hash}
          catalogApiKey={this.props.catalogApiKey}
          bbox={this.props.bbox}
          mode={this._mapMode}
          selectedFeature={this.props.selectedFeature}
          highlightedFeature={this.props.productLineJobs.hovered}
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

  get _detections() {
    if (this._mapMode !== MODE_PRODUCT_LINES) {
      return this.props.detections
    }
    return this.props.productLineJobs.selection.length ? this.props.productLineJobs.selection : this.props.productLines
  }

  get _frames() {
    if (this._mapMode !== MODE_PRODUCT_LINES) {
      return this.props.jobs
    }
    return this.props.productLines.concat(this.props.productLineJobs.selection)
  }

  get _mapMode() {
    switch (this.props.location.pathname) {
    case 'create-job': return (this.props.bbox && this.props.imagery) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
    case 'product-lines': return MODE_PRODUCT_LINES
    default: return MODE_NORMAL
    }
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
    if (feature) {
      this.props.dispatch(selectImage(feature))
    }
    else {
      this.props.dispatch(clearSelectedImage())
    }
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
  productLines:    state.productLines.records,
  productLineJobs: state.productLineJobs,
  selectedFeature: state.productLineJobs.selection[0] || state.draftJob.image || state.jobs.records.find(j => j.id === ownProps.location.query.jobId) || null,
  workers:         state.workers,
}))(Application)

//
// Internals
//

function enumerate(value) {
  return value ? [].concat(value) : []
}

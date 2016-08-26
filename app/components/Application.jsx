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

const styles = require('./Application.css')

import React, {Component} from 'react'
import {render} from 'react-dom'
import {Login} from './Login'
import {Navigation} from './Navigation'
import {PrimaryMap, MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY, MODE_PRODUCT_LINES} from './PrimaryMap'

export const createApplication = (element) => render(<Application/>, element)

const createCollection = (records = []) => ({
  error:    null,
  fetching: false,
  records,
})

export class Application extends Component {

  constructor() {
    super()
    this.state = Object.assign({
      sessionToken: null,

      // Data Collections
      jobs: createCollection(),

      // Map state
      bbox: null,
      mapView: null,
    }, deserialize())
    this._handleAnchorChange = this._handleAnchorChange.bind(this)
    this._handleBoundingBoxChange = this._handleBoundingBoxChange.bind(this)
    this._handleSearchPageChange = this._handleSearchPageChange.bind(this)
    this._handleSelectImage = this._handleSelectImage.bind(this)
    this._handleSelectJob = this._handleSelectJob.bind(this)
  }

  componentDidUpdate(_, prevState) {
    if (!prevState.sessionToken && this.state.sessionToken) {
      // Logged in
    }
    serialize(this.state)
  }

  componentDidMount() {
    // const {dispatch, location, isLoggedIn} = this.props
    // if (isLoggedIn) {
    //   dispatch(discoverCatalogIfNeeded())
    //   dispatch(discoverExecutorIfNeeded())
    //   dispatch(discoverGeoserverIfNeeded())
    //   dispatch(startAlgorithmsWorkerIfNeeded())
    //   dispatch(startJobsWorkerIfNeeded())
    //   dispatch(changeLoadedDetections(enumerate(location.query.jobId)))
    //   // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    //   for (const jobId of enumerate(this.props.location.query.jobId)) {
    //     if (!this.props.jobs.find(j => j.id === jobId)) {
    //       dispatch(importJob(jobId))
    //         .catch(console.log.bind(console))
    //     }
    //   }
    //   // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    // }
  }

  // componentWillReceiveProps(nextProps) {
  //   const {dispatch} = this.props
  //   if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
  //     dispatch(discoverCatalogIfNeeded())
  //     dispatch(discoverExecutorIfNeeded())
  //     dispatch(discoverGeoserverIfNeeded())
  //     dispatch(startAlgorithmsWorkerIfNeeded())
  //     dispatch(startJobsWorkerIfNeeded())
  //   }
  //   if (nextProps.location.pathname !== this.props.location.pathname) {
  //     dispatch(updateSearchBbox(null))
  //   }
  //   if (nextProps.bbox !== this.props.bbox) {
  //     dispatch(clearImagery())
  //   }
  //   dispatch(changeLoadedDetections(enumerate(nextProps.location.query.jobId)))
  // }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={location}/>
        <PrimaryMap
          geoserverUrl={null}
          frames={this._frames}
          detections={this._detections}
          imagery={null}
          isSearching={false}
          view={this.state.mapView}
          catalogApiKey={null}
          bbox={this.state.bbox}
          mode={this._mapMode}
          selectedFeature={null}
          highlightedFeature={null}
          onBoundingBoxChange={bbox => this.setState({ bbox })}
          onSearchPageChange={this._handleSearchPageChange}
          onSelectImage={this._handleSelectImage}
          onSelectJob={this._handleSelectJob}
          onViewChange={mapView => this.setState({ mapView })}
        />
        {this.renderRoute()}
      </div>
    )
  }

  renderRoute() {
    if (!this.state.sessionToken) {
      return (
        <Login
          onError={err => this.setState({ error: err })}
          onSuccess={sessionToken => this.setState({ sessionToken })}
        />
      )
    }
    // switch (location.pathname) {
    //   case '/about':
    //     return (
    //       <About/>
    //     )
    //   case '/create-job':
    //     return (
    //       <CreateJob/>
    //     )
    //   case '/create-product-line':
    //     return (
    //       <CreateProductLine/>
    //     )
    //   case '/help':
    //     return (
    //       <Help/>
    //     )
    //   case '/jobs':
    //     return (
    //       <JobStatusList/>
    //     )
    //   case '/product-lines':
    //     return (
    //       <ProductLineList/>
    //     )
    //   default:

    // }
  }

  //
  // Internal API
  //

  get _detections() {
    return []
    // if (this._mapMode !== MODE_PRODUCT_LINES) {
    //   return this.props.detections
    // }
    // return this.props.productLineJobs.selection.length ? this.props.productLineJobs.selection : this.props.productLines
  }

  get _frames() {
    if (this._mapMode !== MODE_PRODUCT_LINES) {
      return this.state.jobs.records
    }
    return []
    // return this.props.productLines.concat(this.props.productLineJobs.selection)
  }

  get _mapMode() {
    switch (location.pathname) {
    case '/create-job': return (this.state.bbox && this.state.imagery) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
    case '/create-product-line': return MODE_DRAW_BBOX
    case '/product-lines': return MODE_PRODUCT_LINES
    default: return MODE_NORMAL
    }
  }

  _handleAnchorChange(mapAnchor) {
    this.setState({ mapAnchor })
  }

  _handleBoundingBoxChange(bbox) {
    this.setState({ bbox })
  }

  _handleSelectImage(feature) {
    // if (feature) {
    //   this.props.dispatch(selectImage(feature))
    // }
    // else {
    //   this.props.dispatch(clearSelectedImage())
    // }
  }

  _handleSelectJob(jobId) {
    // this.context.router.push({
    //   ...this.props.location,
    //   query: {
    //     jobId: jobId || undefined
    //   }
    // })
  }

  _handleSearchPageChange(paging) {
    // this.props.dispatch(searchCatalog(paging.startIndex, paging.count))
  }
}


//
// Internals
//

function enumerate(value) {
  return value ? [].concat(value) : []
}

function deserialize() {
  return {
    bbox:         JSON.parse(sessionStorage.getItem('bbox')),
    jobs:         createCollection(JSON.parse(localStorage.getItem('jobs_records')) || []),
    mapView:      JSON.parse(sessionStorage.getItem('mapView')),
    sessionToken: sessionStorage.getItem('sessionToken') || null,
  }
}

function serialize(state) {
  console.debug('(serialize)', state)
  sessionStorage.setItem('bbox', JSON.stringify(state.bbox))
  localStorage.setItem('jobs_records', JSON.stringify(state.jobs.records))
  sessionStorage.setItem('mapView', JSON.stringify(state.mapView))
  sessionStorage.setItem('sessionToken', state.sessionToken || '')
}

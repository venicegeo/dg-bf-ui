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

const styles: any = require('./Application.css')

import * as React from 'react'
import {connect} from 'react-redux'
import Navigation from './Navigation'
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY, MODE_PRODUCT_LINES} from './PrimaryMap'
import {
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  importJob,
  // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
  changeLoadedDetections,
  clearImagery,
  clearSelectedImage,
  discoverCatalogIfNeeded,
  discoverExecutorIfNeeded,
  discoverGeoserverIfNeeded,
  searchCatalog,
  selectImage,
  startAlgorithmsWorkerIfNeeded,
  startJobsWorkerIfNeeded,
  updateSearchBbox,
} from '../actions'

interface Props {
  bbox: number[]
  catalogApiKey: string
  detections: any[]
  imagery: any
  isLoggedIn: boolean
  isSearching: boolean
  geoserverUrl: string
  jobs: beachfront.Job[]
  location: any
  productLines: beachfront.Job[]  // FIXME
  productLineJobs: any  // FIXME
  selectedFeature: beachfront.Scene
  changeLoadedDetections(ids: string[])
  clearImagery()
  clearSelectedImage()
  discoverCatalogIfNeeded()
  discoverExecutorIfNeeded()
  discoverGeoserverIfNeeded()
  importJob(id: string)
  searchCatalog(offset: number, count: number)
  selectImage(feature: beachfront.Scene)
  startAlgorithmsWorkerIfNeeded()
  startJobsWorkerIfNeeded()
  updateSearchBbox(bbox: number[])
}

class Application extends React.Component<Props, {}> {
  static contextTypes: React.ValidationMap<any> = {
    router: React.PropTypes.object,
  }

  context: any

  constructor() {
    super()
    this.handleAnchorChange = this.handleAnchorChange.bind(this)
    this.handleBoundingBoxChange = this.handleBoundingBoxChange.bind(this)
    this.handleSearchPageChange = this.handleSearchPageChange.bind(this)
    this.handleSelectImage = this.handleSelectImage.bind(this)
    this.handleSelectJob = this.handleSelectJob.bind(this)
  }

  componentDidMount() {
    const {location, isLoggedIn} = this.props
    if (isLoggedIn) {
      this.props.discoverCatalogIfNeeded()
      this.props.discoverExecutorIfNeeded()
      this.props.discoverGeoserverIfNeeded()
      this.props.startAlgorithmsWorkerIfNeeded()
      this.props.startJobsWorkerIfNeeded()
      this.props.changeLoadedDetections(enumerate(location.query.jobId))
      // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
      for (const jobId of enumerate(this.props.location.query.jobId)) {
        if (!this.props.jobs.find(j => j.id === jobId)) {
          this.props.importJob(jobId)
            .catch(console.log.bind(console))
        }
      }
      // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
      this.props.discoverCatalogIfNeeded()
      this.props.discoverExecutorIfNeeded()
      this.props.discoverGeoserverIfNeeded()
      this.props.startAlgorithmsWorkerIfNeeded()
      this.props.startJobsWorkerIfNeeded()
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.props.updateSearchBbox(null)
    }
    if (nextProps.bbox !== this.props.bbox) {
      this.props.clearImagery()
    }
    this.props.changeLoadedDetections(enumerate(nextProps.location.query.jobId))
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap
          geoserverUrl={this.props.geoserverUrl}
          frames={this.framesForCurrentMode}
          detections={this.detectionsForCurrentMode}
          imagery={this.props.imagery}
          isSearching={this.props.isSearching}
          anchor={this.props.location.hash}
          catalogApiKey={this.props.catalogApiKey}
          bbox={this.props.bbox}
          mode={this.mapMode}
          selectedFeature={this.props.selectedFeature}
          highlightedFeature={this.props.productLineJobs.hovered}
          onAnchorChange={this.handleAnchorChange}
          onBoundingBoxChange={this.handleBoundingBoxChange}
          onSearchPageChange={this.handleSearchPageChange}
          onSelectImage={this.handleSelectImage}
          onSelectJob={this.handleSelectJob}
        />
        {this.props.children}
      </div>
    )
  }

  //
  // Internal API
  //

  private get detectionsForCurrentMode() {
    if (this.mapMode !== MODE_PRODUCT_LINES) {
      return this.props.detections
    }
    return this.props.productLineJobs.selection.length ? this.props.productLineJobs.selection : this.props.productLines
  }

  private get framesForCurrentMode() {
    if (this.mapMode !== MODE_PRODUCT_LINES) {
      return this.props.jobs
    }
    return this.props.productLines.concat(this.props.productLineJobs.selection)
  }

  private get mapMode() {
    switch (this.props.location.pathname) {
      case 'create-job': return (this.props.bbox && this.props.imagery) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
      case 'product-lines': return MODE_PRODUCT_LINES
      default: return MODE_NORMAL
    }
  }

  private handleAnchorChange(anchor) {
    if (this.props.location.hash !== anchor) {
      this.context.router.replace(Object.assign({}, this.props.location, {
        hash: anchor,
      }))
    }
  }

  private handleBoundingBoxChange(bbox) {
    this.props.updateSearchBbox(bbox)
  }

  private handleSelectImage(feature) {
    if (feature) {
      this.props.selectImage(feature)
    }
    else {
      this.props.clearSelectedImage()
    }
  }

  private handleSelectJob(jobId) {
    this.context.router.push({
      hash:     this.props.location.hash,
      pathname: this.props.location.pathname,
      query: {
        jobId: jobId || undefined,
      },
    })
  }

  private handleSearchPageChange({ count, startIndex }) {
    this.props.searchCatalog(startIndex, count)
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
}), dispatch => ({
  changeLoadedResults:           (jobIds) => dispatch(changeLoadedDetections(jobIds)),
  clearImagery:                  () => dispatch(clearImagery()),
  clearSelectedImage:            () => dispatch(clearSelectedImage()),
  discoverCatalogIfNeeded:       () => dispatch(discoverCatalogIfNeeded()),
  discoverExecutorIfNeeded:      () => dispatch(discoverExecutorIfNeeded()),
  importJob:                     (jobId) => dispatch(importJob(jobId)),
  discoverGeoserverIfNeeded:     () => dispatch(discoverGeoserverIfNeeded()),
  changeLoadedDetections:        () => dispatch(changeLoadedDetections()),
  searchCatalog:                 (offset, count) => dispatch(searchCatalog(offset, count)),
  selectImage:                   (feature) => dispatch(selectImage(feature)),
  startAlgorithmsWorkerIfNeeded: () => dispatch(startAlgorithmsWorkerIfNeeded()),
  startJobsWorkerIfNeeded:       () => dispatch(startJobsWorkerIfNeeded()),
  updateSearchBbox:              (bbox) => dispatch(updateSearchBbox(bbox)),
}))(Application)

//
// Helpers
//

function enumerate(value) {
  return value ? [].concat(value) : []
}

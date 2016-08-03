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
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY} from './PrimaryMap'
import {
  clearImagery,
  changeLoadedResults,
  discoverCatalogIfNeeded,
  discoverExecutorIfNeeded,
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
  jobs: beachfront.Job[]
  location: any
  selectedFeature: beachfront.Scene
  changeLoadedResults(ids: string[])
  clearImagery()
  discoverCatalogIfNeeded()
  discoverExecutorIfNeeded()
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
      this.props.startAlgorithmsWorkerIfNeeded()
      this.props.startJobsWorkerIfNeeded()
    }
    this.props.changeLoadedResults(asArray(location.query.jobId))
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isLoggedIn && nextProps.isLoggedIn) {
      this.props.discoverCatalogIfNeeded()
      this.props.discoverExecutorIfNeeded()
      this.props.startAlgorithmsWorkerIfNeeded()
      this.props.startJobsWorkerIfNeeded()
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.props.updateSearchBbox(null)
    }
    if (nextProps.bbox !== this.props.bbox) {
      this.props.clearImagery()
    }
    this.props.changeLoadedResults(asArray(nextProps.location.query.jobId))
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap
          jobs={this.props.jobs}
          detections={this.props.detections}
          imagery={this.props.imagery}
          isSearching={this.props.isSearching}
          anchor={this.props.location.hash}
          catalogApiKey={this.props.catalogApiKey}
          bbox={this.props.bbox}
          mode={this.mapMode}
          selectedFeature={this.props.selectedFeature}
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

  private get mapMode() {
    if (this.props.location.pathname === 'create-job') {
      return (this.props.bbox && this.props.imagery) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
    }
    return MODE_NORMAL
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
    this.props.selectImage(feature)
  }

  private handleSelectJob(jobId) {
    this.context.router.push(Object.assign({}, this.props.location, {
      query: {
        jobId: jobId || undefined,
      },
    }))
  }

  private handleSearchPageChange({count, startIndex}) {
    this.props.searchCatalog(startIndex, count)
  }
}

export default connect((state, ownProps) => ({
  bbox:            state.search.bbox,
  catalogApiKey:   state.catalog.apiKey,
  detections:      state.results,
  imagery:         state.imagery,
  jobs:            state.jobs.records,
  isLoggedIn:      !!state.authentication.token,
  isSearching:     state.search.searching,
  selectedFeature: state.draftJob.image || state.jobs.records.find(j => j.id === ownProps.location.query.jobId) || null,
}), dispatch => ({
  changeLoadedResults:           (jobIds) => dispatch(changeLoadedResults(jobIds)),
  clearImagery:                  () => dispatch(clearImagery()),
  discoverCatalogIfNeeded:       () => dispatch(discoverCatalogIfNeeded()),
  discoverExecutorIfNeeded:      () => dispatch(discoverExecutorIfNeeded()),
  searchCatalog:                 (offset, count) => dispatch(searchCatalog(offset, count)),
  selectImage:                   (feature) => dispatch(selectImage(feature)),
  startAlgorithmsWorkerIfNeeded: () => dispatch(startAlgorithmsWorkerIfNeeded()),
  startJobsWorkerIfNeeded:       () => dispatch(startJobsWorkerIfNeeded()),
  updateSearchBbox:              (bbox) => dispatch(updateSearchBbox(bbox)),
}))(Application)

//
// Internals
//

function asArray(value) {
  if (value) {
    return [].concat(value)
  }
}

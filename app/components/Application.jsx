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
  discoverServiceIfNeeded,
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
    bbox: React.PropTypes.arrayOf(React.PropTypes.number),
    children: React.PropTypes.element,
    datasets: React.PropTypes.array.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    imagerySearchResults: React.PropTypes.object,
    isLoggedIn: React.PropTypes.bool.isRequired,
    isSearchingForImagery: React.PropTypes.bool.isRequired,
    location: React.PropTypes.object.isRequired,
    workers: React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this._handleAnchorChange = this._handleAnchorChange.bind(this)
    this._handleBoundingBoxChange = this._handleBoundingBoxChange.bind(this)
    this._handleImagerySearchPageChange = this._handleImagerySearchPageChange.bind(this)
    this._handleImageSelect = this._handleImageSelect.bind(this)
  }

  componentDidMount() {
    const {dispatch, location, isLoggedIn} = this.props
    if (isLoggedIn) {
      dispatch(discoverServiceIfNeeded())
      dispatch(startAlgorithmsWorkerIfNeeded())
      dispatch(startJobsWorkerIfNeeded())
    }
    dispatch(changeLoadedResults(asArray(location.query.jobId)))
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch} = this.props
    if (!this.props.isLoggedIn && nextProps.isLoggedIn) {
      dispatch(discoverServiceIfNeeded())
      dispatch(startAlgorithmsWorkerIfNeeded())
      dispatch(startJobsWorkerIfNeeded())
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      dispatch(updateSearchBbox(null))
    }
    if (nextProps.bbox !== this.props.bbox) {
      dispatch(clearImagery())
    }
    dispatch(changeLoadedResults(asArray(nextProps.location.query.jobId)))
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap datasets={this.props.datasets}
                    imagery={this.props.imagerySearchResults}
                    isSearching={this.props.isSearchingForImagery}
                    anchor={this.props.location.hash}
                    bbox={this.props.bbox}
                    mode={this._mapMode}
                    onAnchorChange={this._handleAnchorChange}
                    onBoundingBoxChange={this._handleBoundingBoxChange}
                    onImagerySearchPageChange={this._handleImagerySearchPageChange}
                    onImageSelect={this._handleImageSelect}/>
        {this.props.children}
      </div>
    )
  }

  //
  // Internal API
  //

  get _mapMode() {
    if (this.props.location.pathname === 'create-job') {
      return (this.props.bbox && this.props.imagerySearchResults) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
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

  _handleImagerySearchPageChange(paging) {
    this.props.dispatch(searchCatalog(paging.startIndex, paging.count))
  }

  _handleImageSelect(geojson) {
    this.props.dispatch(selectImage(geojson))
  }
}

export default connect(state => ({
  bbox:     state.search.bbox,
  datasets: state.jobs.records.map(job => {
    const result = state.results[job.id]
    return {
      job,
      geojson: result ? result.geojson : null,
      progress: result ? result.progress : null
    }
  }),
  imagery:     state.imagery,
  isLoggedIn:  !!state.authentication.token,
  isSearching: state.search.searching,
  workers:     state.workers,
}))(Application)

//
// Internals
//

function asArray(value) {
  if (value) {
    return [].concat(value)
  }
}

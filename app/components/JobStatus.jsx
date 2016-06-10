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
import moment from 'moment'
import {Link} from 'react-router'
import Timer from './Timestamp.jsx'
import {serializeFromBbox} from '../utils/map-anchor'
import styles from './JobStatus.css'

import {
  STATUS_SUCCESS,
  STATUS_RUNNING,
  STATUS_ERROR,
  STATUS_TIMED_OUT
} from '../constants'

export default class JobStatus extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    job: React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      resultId: React.PropTypes.string,
      status: React.PropTypes.string
    }).isRequired,
    onDownload: React.PropTypes.func.isRequired,
    result: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {isDownloading: false, isExpanded: false}
    this._handleDownloadClicked = this._handleDownloadClicked.bind(this)
    this._handleExpansionToggle = this._handleExpansionToggle.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.isDownloading && nextProps.result && nextProps.result.geojson) {
      this._triggerDownload(nextProps.result.geojson)
    }
  }

  render() {  // eslint-disable-line
    // TODO -- style for "active"
    const {job} = this.props
    const progress = calculateProgress(this.props.result) || {}
    return (
      <li className={`${styles.root} ${this._classForStatus} ${this._classForExpansion} ${this._classForDownloading} ${this._classForLoading}`}>
        <div className={styles.details} onClick={this._handleExpansionToggle}>
          <h3 className={styles.title}>
            <i className={`fa fa-chevron-right ${styles.caret}`}/>
            <span>{job.name}</span>
          </h3>

          <div className={styles.summary}>
            <span className={styles.status}>{job.status}</span>
            <Timer className={styles.timer} timestamp={job.createdOn}/>
          </div>

          <div className={styles.progressBar} title={progress.verbose}>
            <div className={styles.puck} style={{width: progress.percentage}}></div>
          </div>

          <div className={styles.metadata}>
            <dl>
              <dt>Image ID</dt>
              <dd>{job.imageId || 'No ID?'}</dd>
              <dt>Algorithm</dt>
              <dd>{job.algorithmName}</dd>
              <dt>Date Started</dt>
              <dd>{moment(job.createdOn).format('llll')}</dd>
            </dl>
          </div>
        </div>

        <div className={styles.controls}>
          <Link to={{pathname: '/',
                     query: {jobId: job.status === STATUS_SUCCESS ? job.id : undefined},
                     hash: serializeFromBbox(job.bbox)}}
                title="View on Map">
            <i className="fa fa-globe"/>
          </Link>
          {job.status === STATUS_SUCCESS && (
            <a className={styles.download}
               title={this.state.isDownloading ? progress.percentage : 'Download'}
               onClick={this._handleDownloadClicked}>
              {this.state.isDownloading ? progress.percentage : <i className="fa fa-cloud-download"/>}
            </a>
          )}
        </div>
      </li>
    )
  }

  //
  // Internals
  //

  get _classForDownloading() {
    return this.state.isDownloading ? styles.isDownloading : ''
  }

  get _classForExpansion() {
    return this.state.isExpanded ? styles.isExpanded : ''
  }

  get _classForLoading() {
    return (this.props.result && this.props.result.loading) ? styles.isLoading : ''
  }

  get _classForStatus() {
    switch (this.props.job.status) {
    case STATUS_SUCCESS: return styles.succeeded
    case STATUS_RUNNING: return styles.running
    case STATUS_TIMED_OUT: return styles.timedOut
    case STATUS_ERROR: return styles.failed
    default: return ''
    }
  }

  _handleDownloadClicked() {
    const {result} = this.props
    if (result && result.geojson) {
      this._triggerDownload(result.geojson)
      return
    }
    if (!this.state.isDownloading) {
      this.setState({isDownloading: true})
      setTimeout(() => this.props.onDownload(this.props.job))
    }
  }

  _handleExpansionToggle() {
    this.setState({isExpanded: !this.state.isExpanded})
  }

  _triggerDownload(contents) {
    this.setState({isDownloading: false})
    const file = new File([contents], {type: 'application/json'})
    const virtualHyperlink = document.createElement('a')
    virtualHyperlink.href = URL.createObjectURL(file)
    virtualHyperlink.download = this.props.job.name + '.geojson'
    document.body.appendChild(virtualHyperlink)
    virtualHyperlink.click()
    document.body.removeChild(virtualHyperlink)
  }
}

//
// Helper Component
//

const MB = 1024000

function calculateProgress(result) {
  if (result && result.progress && result.progress.total) {
    const {loaded, total} = result.progress
    const loadedMB = (Math.round((loaded / MB) * 10) / 10)
    const totalMB = (Math.round((total / MB) * 10) / 10)
    return {
      percentage: Math.ceil((loaded / total) * 100) + '%',
      verbose: `Retrieving GeoJSON (${loadedMB} of ${totalMB}MB)`
    }
  }
}

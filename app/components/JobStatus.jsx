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
import {FileDownloadLink} from './FileDownloadLink'
import {Link} from './Link'
import Timestamp from './Timestamp'
import styles from './JobStatus.css'

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_IMAGE_ID,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_SENSOR,
  KEY_NAME,
  KEY_STATUS,
  KEY_GEOJSON_DATA_ID,
  STATUS_SUCCESS,
  STATUS_RUNNING,
  STATUS_ERROR,
  STATUS_TIMED_OUT
} from '../constants'

export default class JobStatus extends Component {
  static propTypes = {
    authToken:   React.PropTypes.string.isRequired,
    className:   React.PropTypes.string,
    isActive:    React.PropTypes.bool.isRequired,
    job:         React.PropTypes.shape({
      id:         React.PropTypes.string.isRequired,
      geometry:   React.PropTypes.object.isRequired,
      properties: React.PropTypes.object.isRequired,
    }).isRequired,
    onForgetJob: React.PropTypes.func.isRequired,
    onNavigate: React.PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {
      downloadProgress: 0,
      isDownloading: false,
      isExpanded: false,
      isRemoving: false,
    }
    this._emitOnForgetJob = this._emitOnForgetJob.bind(this)
    this._handleDownloadComplete = this._handleDownloadComplete.bind(this)
    this._handleDownloadError = this._handleDownloadError.bind(this)
    this._handleDownloadProgress = this._handleDownloadProgress.bind(this)
    this._handleDownloadStart = this._handleDownloadStart.bind(this)
    this._handleExpansionToggle = this._handleExpansionToggle.bind(this)
    this._handleForgetToggle = this._handleForgetToggle.bind(this)
  }

  render() {  // eslint-disable-line
    const {id, properties} = this.props.job
    const name = properties[KEY_NAME]
    const status = properties[KEY_STATUS]
    const createdOn = properties[KEY_CREATED_ON]
    const imageId = properties[KEY_IMAGE_ID]
    const algorithmName = properties[KEY_ALGORITHM_NAME]
    const capturedOn = properties[KEY_IMAGE_CAPTURED_ON]
    const sensor = properties[KEY_IMAGE_SENSOR]
    const resultDataId = properties[KEY_GEOJSON_DATA_ID]
    const canDownload = status === STATUS_SUCCESS && resultDataId
    const downloadPercentage = `${this.state.downloadProgress || 0}%`
    return (
      <li className={`${styles.root} ${this._aggregatedClassNames}`}>
        <div className={styles.details} onClick={this._handleExpansionToggle}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              <i className={`fa fa-chevron-right ${styles.caret}`}/>
              <span>{name}</span>
            </h3>

            <div className={styles.summary}>
              <span className={styles.status}>{status}</span>
              <Timestamp
                className={styles.timer}
                timestamp={createdOn}
              />
            </div>
          </div>

          <div className={styles.progressBar} title={downloadPercentage}>
            <div className={styles.puck} style={{width: downloadPercentage}}/>
          </div>

          <div className={styles.metadata} onClick={e => e.stopPropagation()}>
            <dl>
              <dt>Algorithm</dt>
              <dd>{algorithmName}</dd>
              <dt>Image ID</dt>
              <dd>{imageId || 'No ID?'}</dd>
              <dt>Captured On</dt>
              <dd>{moment(capturedOn).utc().format('MM/DD/YYYY HH:mm z')}</dd>
              <dt>Sensor</dt>
              <dd>{sensor}</dd>
            </dl>
            <div className={styles.removeToggle}>
              <button onClick={this._handleForgetToggle}>
                Remove this Job
              </button>
            </div>
            <div className={styles.removeWarning}>
              <h4>
                <i className="fa fa-warning"/> Are you sure you want to remove this job from your list?
              </h4>
              <button onClick={this._emitOnForgetJob}>Remove this Job</button>
              <button onClick={this._handleForgetToggle}>Cancel</button>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <Link
            pathname="/"
            search={'?jobId=' + id}
            title="View on Map"
            onClick={this.props.onNavigate}>
            <i className="fa fa-globe"/>
          </Link>
          {canDownload && (
            <FileDownloadLink
              authToken={this.props.authToken}
              dataId={resultDataId}
              filename={name + '.geojson'}
              className={styles.download}
              onProgress={this._handleDownloadProgress}
              onStart={this._handleDownloadStart}
              onComplete={this._handleDownloadComplete}
              onError={this._handleDownloadError}
            />
          )}
        </div>
      </li>
    )
  }

  //
  // Internals
  //

  get _aggregatedClassNames() {
    return [
      this._classForActive,
      this._classForDownloading,
      this._classForExpansion,
      this._classForLoading,
      this._classForRemoving,
      this._classForStatus,
    ].filter(Boolean).join(' ')
  }

  get _classForActive() {
    return this.props.isActive ? styles.isActive : ''
  }

  get _classForDownloading() {
    return this.state.isDownloading ? styles.isDownloading : ''
  }

  get _classForExpansion() {
    return this.state.isExpanded ? styles.isExpanded : ''
  }

  get _classForLoading() {
    return (this.state.isDownloading) ? styles.isLoading : ''
  }

  get _classForRemoving() {
    return this.state.isRemoving ? styles.isRemoving : ''
  }

  get _classForStatus() {
    switch (this.props.job.properties[KEY_STATUS]) {
    case STATUS_SUCCESS: return styles.succeeded
    case STATUS_RUNNING: return styles.running
    case STATUS_TIMED_OUT: return styles.timedOut
    case STATUS_ERROR: return styles.failed
    default: return ''
    }
  }

  _emitOnForgetJob() {
    this.props.onForgetJob(this.props.job.id)
  }

  _handleDownloadProgress(loadedBytes, totalBytes) {
    this.setState({
      downloadProgress: Math.floor((loadedBytes / totalBytes) * 100)
    })
  }

  _handleDownloadStart() {
    this.setState({ isDownloading: true })
  }

  _handleDownloadComplete() {
    this.setState({ isDownloading: false })
  }

  _handleDownloadError(err) {
    this.setState({ isDownloading: false })
    console.error('Download failed: ' + err.stack)
  }

  _handleExpansionToggle() {
    this.setState({
      isExpanded: !this.state.isExpanded,
      isRemoving: false,
    })
  }

  _handleForgetToggle() {
    this.setState({isRemoving: !this.state.isRemoving})
  }
}

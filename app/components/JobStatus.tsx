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

const styles: any = require('./JobStatus.css')

import * as React from 'react'
import * as moment from 'moment'
import {Link} from 'react-router'
import Timestamp from './Timestamp'
import FileDownloadLink from './FileDownloadLink'
import {featureToAnchor} from '../utils/map-anchor'

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
  STATUS_TIMED_OUT,
} from '../constants'

interface Props {
  className?: string
  isActive: boolean
  job: beachfront.Job
  onForgetJob(jobId: string)
}

interface State {
  downloadProgress?: number,
  isDownloading?: boolean
  isExpanded?: boolean
  isRemoving?: boolean
}

export default class JobStatus extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      downloadProgress: 0,
      isDownloading: false,
      isExpanded: false,
      isRemoving: false,
    }
    this.emitOnForgetJob        = this.emitOnForgetJob.bind(this)
    this.handleDownloadComplete = this.handleDownloadComplete.bind(this)
    this.handleDownloadError    = this.handleDownloadError.bind(this)
    this.handleDownloadProgress = this.handleDownloadProgress.bind(this)
    this.handleDownloadStart    = this.handleDownloadStart.bind(this)
    this.handleExpansionToggle  = this.handleExpansionToggle.bind(this)
    this.handleForgetToggle     = this.handleForgetToggle.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.isDownloading && !nextProps.result) {
      this.setState({isDownloading: false})
    }
    if (this.state.isDownloading && nextProps.result && nextProps.result.geojson) {
      this.triggerDownload(nextProps.result.geojson)
    }
  }

  render() {
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
      <li className={`${styles.root} ${this.aggregatedClassNames}`}>
        <div className={styles.details} onClick={this.handleExpansionToggle}>
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
              <button onClick={this.handleForgetToggle}>
                Remove this Job
              </button>
            </div>
            <div className={styles.removeWarning}>
              <h4>
                <i className="fa fa-warning"/> Are you sure you want to remove this job from your list?
              </h4>
              <button onClick={this.emitOnForgetJob}>Remove this Job</button>
              <button onClick={this.handleForgetToggle}>Cancel</button>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <Link
            to={{
              pathname: '/',
              query: {jobId: id},
              hash: featureToAnchor(this.props.job),
            }}
            title="View on Map"
          >
            <i className="fa fa-globe"/>
          </Link>
          {canDownload && (
            <FileDownloadLink
              dataId={resultDataId}
              filename={name + '.geojson'}
              className={styles.download}
              onProgress={this.handleDownloadProgress}
              onStart={this.handleDownloadStart}
              onComplete={this.handleDownloadComplete}
              onError={this.handleDownloadError}
            />
          )}
        </div>
      </li>
    )
  }

  //
  // Internals
  //

  private get aggregatedClassNames() {
    return [
      this.classForActive,
      this.classForDownloading,
      this.classForExpansion,
      this.classForLoading,
      this.classForRemoving,
      this._classForStatus,
    ].filter(Boolean).join(' ')
  }

  private get classForActive() {
    return this.props.isActive ? styles.isActive : ''
  }

  private get classForDownloading() {
    return this.state.isDownloading ? styles.isDownloading : ''
  }

  private get classForExpansion() {
    return this.state.isExpanded ? styles.isExpanded : ''
  }

  private get classForLoading() {
    return (this.state.isDownloading) ? styles.isLoading : ''
  }

  private get classForRemoving() {
    return this.state.isRemoving ? styles.isRemoving : ''
  }

  private get _classForStatus() {
    switch (this.props.job.properties[KEY_STATUS]) {
    case STATUS_SUCCESS: return styles.succeeded
    case STATUS_RUNNING: return styles.running
    case STATUS_TIMED_OUT: return styles.timedOut
    case STATUS_ERROR: return styles.failed
    default: return ''
    }
  }

  private emitOnForgetJob() {
    this.props.onForgetJob(this.props.job.id)
  }

  private handleDownloadProgress(loadedBytes, totalBytes) {
    this.setState({
      downloadProgress: Math.floor((loadedBytes / totalBytes) * 100),
    })
  }

  private handleDownloadStart() {
    this.setState({ isDownloading: true })
  }

  private handleDownloadComplete() {
    this.setState({ isDownloading: false })
  }

  private handleDownloadError(err) {
    this.setState({ isDownloading: false })
    console.error('Download failed: ' + err.stack)
  }

  private handleExpansionToggle() {
    this.setState({
      isExpanded: !this.state.isExpanded,
      isRemoving: false,
    })
  }

  private handleForgetToggle() {
    this.setState({ isRemoving: !this.state.isRemoving })
  }
}

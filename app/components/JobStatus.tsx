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
import Timer from './Timestamp'
import {featureToAnchor} from '../utils/map-anchor'

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_IMAGE_ID,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_SENSOR,
  KEY_NAME,
  KEY_STATUS,
  STATUS_SUCCESS,
  STATUS_RUNNING,
  STATUS_ERROR,
  STATUS_TIMED_OUT,
} from '../constants'

interface Props {
  className?: string
  isActive: boolean
  job: beachfront.Job
  result: {loading: boolean, geojson: string}
  onDownload(job: beachfront.Job)
  onForgetJob(jobId: string)
}

interface State {
  isDownloading?: boolean
  isExpanded?: boolean
  isRemoving?: boolean
}

export default class JobStatus extends React.Component<Props, State> {
  constructor() {
    super()
    this.state                 = {isDownloading: false, isExpanded: false, isRemoving: false}
    this.emitOnForgetJob       = this.emitOnForgetJob.bind(this)
    this.handleDownloadClicked = this.handleDownloadClicked.bind(this)
    this.handleExpansionToggle = this.handleExpansionToggle.bind(this)
    this.handleForgetToggle    = this.handleForgetToggle.bind(this)
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
    const progress = calculateProgress(this.props.result)
    const name = properties[KEY_NAME]
    const status = properties[KEY_STATUS]
    const createdOn = properties[KEY_CREATED_ON]
    const imageId = properties[KEY_IMAGE_ID]
    const algorithmName = properties[KEY_ALGORITHM_NAME]
    const capturedOn = properties[KEY_IMAGE_CAPTURED_ON]
    const sensor = properties[KEY_IMAGE_SENSOR]
    return (
      <li className={`${styles.root} ${this.aggregatedClassNames}`}>
        <div className={styles.details} onClick={this.handleExpansionToggle}>
          <h3 className={styles.title}>
            <i className={`fa fa-chevron-right ${styles.caret}`}/>
            <span>{name}</span>
          </h3>

          <div className={styles.summary}>
            <span className={styles.status}>{status}</span>
            <Timer
              className={styles.timer}
              timestamp={createdOn}
            />
          </div>

          <div className={styles.progressBar} title={progress.verbose}>
            <div className={styles.puck} style={{width: progress.percentage}}></div>
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
          {status === STATUS_SUCCESS && (
            <a
              className={styles.download}
              title={this.state.isDownloading ? progress.percentage : 'Download'}
              onClick={this.handleDownloadClicked}
            >
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
    return (this.props.result && this.props.result.loading) ? styles.isLoading : ''
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

  private handleDownloadClicked() {
    const {result} = this.props
    if (result && result.geojson) {
      this.triggerDownload(result.geojson)
      return
    }
    if (!this.state.isDownloading) {
      this.setState({isDownloading: true})
      setTimeout(() => this.props.onDownload(this.props.job))
    }
  }

  private handleExpansionToggle() {
    this.setState({
      isExpanded: !this.state.isExpanded,
      isRemoving: false,
    })
  }

  private handleForgetToggle() {
    this.setState({isRemoving: !this.state.isRemoving})
  }

  private triggerDownload(contents) {
    this.setState({isDownloading: false})
    const filename = this.props.job.properties[KEY_NAME] + '.geojson'
    const file = new File([contents], filename, {type: 'application/json'})
    const virtualHyperlink = document.createElement('a')
    virtualHyperlink.href = URL.createObjectURL(file)
    virtualHyperlink.download = filename
    document.body.appendChild(virtualHyperlink)
    virtualHyperlink.click()
    document.body.removeChild(virtualHyperlink)
  }
}

//
// Helper Component
//

const MB = 1024000

function calculateProgress(result): any {
  if (result && result.progress && result.progress.total) {
    const {loaded, total} = result.progress
    const loadedMB = (Math.round((loaded / MB) * 10) / 10)
    const totalMB = (Math.round((total / MB) * 10) / 10)
    return {
      percentage: Math.ceil((loaded / total) * 100) + '%',
      verbose: `Retrieving GeoJSON (${loadedMB} of ${totalMB}MB)`,
    }
  }
  return {}
}

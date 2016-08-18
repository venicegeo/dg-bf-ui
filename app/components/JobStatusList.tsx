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

const styles: any = require('./JobStatusList.css')

import * as React from 'react'
import {connect} from 'react-redux'
import JobStatus from './JobStatus'
import {
  dismissJobError,
  removeJob,
  startJobsWorkerIfNeeded,
} from '../actions'

interface Props {
  error: any
  jobs: beachfront.Job[]
  location: any
  dismissJobError()
  downloadResult(jobId: string)
  removeJob(jobId: string)
  startJobsWorkerIfNeeded()
}

class JobStatusList extends React.Component<Props, {}> {
  static contextTypes: React.ValidationMap<any> = {
    router: React.PropTypes.object,
  }

  context: any

  constructor() {
    super()
    this._dismissError = this._dismissError.bind(this)
    this._handleForgetJob = this._handleForgetJob.bind(this)
  }

  render() {
    const isEmpty = (this.props.jobs.length === 0)
    return (
      <div className={`${styles.root} ${isEmpty ? styles.isEmpty : ''}`}>
        <header>
          <h1>Jobs</h1>
        </header>

        <ul>
          {this.props.error && (
            <li className={styles.communicationError}>
              <h4><i className="fa fa-warning"/> Communication Error</h4>
              <p>Cannot communicate with the server. (<code>{this.props.error.toString()}</code>)</p>
              <button onClick={this._dismissError}>Retry</button>
            </li>
          )}

          {isEmpty ? (
            <li className={styles.placeholder}>You haven&quot;t started any jobs yet</li>
          ) : this.props.jobs.map(job => (
            <JobStatus
              key={job.id}
              isActive={this._isActive(job.id)}
              job={job}
              onForgetJob={this._handleForgetJob}
            />
          ))}
        </ul>
      </div>
    )
  }

  _dismissError() {
    this.props.dismissJobError()
    this.props.startJobsWorkerIfNeeded()
  }

  _handleForgetJob(jobId) {
    if (this._isActive(jobId)) {
      this.context.router.push(Object.assign({}, this.props.location, {
        query: {},
      }))
    }
    this.props.removeJob(jobId)
  }

  _isActive(jobId) {
    const activeIds = [].concat(this.props.location.query.jobId)
    return activeIds.indexOf(jobId) !== -1
  }
}

export default connect(state => ({
  error:   state.jobs.error,
  jobs:    state.jobs.records,
}), dispatch => ({
  dismissJobError:         () => dispatch(dismissJobError()),
  removeJob:               (jobId) => dispatch(removeJob(jobId)),
  startJobsWorkerIfNeeded: () => dispatch(startJobsWorkerIfNeeded()),
}))(JobStatusList)

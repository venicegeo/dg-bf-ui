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
import JobStatus from './JobStatus'
import styles from './JobStatusList.css'
import {
  dismissJobError,
  downloadResult,
  startJobsWorkerIfNeeded,
} from '../actions'

class JobStatusList extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    error:    React.PropTypes.object,
    jobs:     React.PropTypes.array.isRequired,
    location: React.PropTypes.object,
    results:  React.PropTypes.object.isRequired,
  }

  constructor() {
    super()
    this._dismissError = this._dismissError.bind(this)
    this._handleDownload = this._handleDownload.bind(this)
  }

  render() {
    return (
      <div className={styles.root}>
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

          {this.props.jobs.length ?
            this.props.jobs.map(job => <JobStatus key={job.id}
                                                  job={job}
                                                  result={this.props.results[job.id]}
                                                  onDownload={this._handleDownload}/>) :
            <li className={styles.placeholder}>You haven't started any jobs yet</li>
          }
        </ul>
      </div>
    )
  }

  _dismissError() {
    this.props.dispatch(dismissJobError())
    this.props.dispatch(startJobsWorkerIfNeeded())
  }

  _handleDownload(job) {
    this.context.router.push({...this.props.location,
      // HACK -- ensure job isn't automatically unloaded because its ID isn't in the URL
      query: {
        jobId: job.id
      }
    })
    this.props.dispatch(downloadResult(job.id))
  }
}

export default connect(state => ({
  error:   state.jobs.error,
  jobs:    state.jobs.records,
  results: state.results,
}))(JobStatusList)

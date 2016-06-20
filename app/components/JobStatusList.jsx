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
import {downloadResult} from '../actions'

function selector(state) {
  return {
    jobs: state.jobs.records,
    results: state.results
  }
}

class JobStatusList extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    jobs: React.PropTypes.array.isRequired,
    location: React.PropTypes.object,
    params: React.PropTypes.object.isRequired,
    results: React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this._dismissError = this._dismissError.bind(this)
    this._handleDownload = this._handleDownload.bind(this)
  }

  render() {
    const err = null  // FIXME
    return (
      <div className={styles.root}>
        <header>
          <h1>Jobs</h1>
        </header>

        <ul>

          {err && (
            <li className={styles.communicationError}>
              <div className={styles.message}>
                <i className="fa fa-warning"/> Cannot communicate with the server
              </div>
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
    console.warn('_dismissError: Not yet implemented')
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

export default connect(selector)(JobStatusList)

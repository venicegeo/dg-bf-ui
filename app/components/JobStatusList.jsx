import React, {Component} from 'react'
import {connect} from 'react-redux'
import JobStatus from './JobStatus'
import {downloadResult} from '../actions'
import styles from './JobStatusList.css'

function selector(state) {
  return {
    jobs: state.jobs.records,
    results: state.results
  }
}

class JobStatusList extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    jobs: React.PropTypes.array,
    params: React.PropTypes.object,
    results: React.PropTypes.object
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
    this.props.dispatch(downloadResult(job.id))
  }
}

export default connect(selector)(JobStatusList)

import React, {Component} from 'react'
import styles from './JobStatusList.css'
import JobStatus from './JobStatus'
import {fetchJobs} from '../api'

const SECOND = 1000
const POLL_INTERVAL = 1 * SECOND  // FIXME -- it might make more sense to have this be pub/sub

export default class JobStatusList extends Component {
  static propTypes = {
    params: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {jobs: [], communicationError: null}
    this._checkStatus = this._checkStatus.bind(this)
  }

  componentDidMount() {
    this._activatePolling(POLL_INTERVAL)
  }

  componentWillUnmount() {
    this._deactivatePolling()
  }

  render() {
    const {jobs, communicationError} = this.state
    return (
      <ul className={styles.root}>
        <li className={styles.header}>
          <h1>Jobs</h1>
        </li>

        {/* TODO -- this need to get passed in somehow */}
        {communicationError && (
          <li className={styles.communicationDown}>
            <div className={styles.message}>
              <i className="fa fa-warning"/> Cannot communicate with the server
            </div>
            <button>Retry</button>
          </li>
        )}

        {jobs.length ?
          jobs.map(job => <JobStatus key={job.id} job={job}/>) :
          <li className={styles.placeholder}>You haven't started any jobs yet</li>
        }
      </ul>
    )
  }

  _activatePolling(interval) {
    console.debug('@job-status-list#_activatePolling', interval)
    this._checkStatus()
      .then(() => {
        this._intervalId = setInterval(this._checkStatus, interval)
      })
      .catch(error => {
        this._deactivatePolling()
        // TODO - disable polling until error is dismissed
        console.error(error)
      })
  }

  _deactivatePolling() {
    console.debug('@job-status-list#_deactivatePolling')
    clearInterval(this._intervalId)
  }

  _checkStatus() {
    return fetchJobs().then(jobs => this.setState({jobs}))
  }
}

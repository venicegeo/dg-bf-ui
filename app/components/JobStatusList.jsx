import React, {Component} from 'react'
import styles from './JobStatusList.css'
import JobStatus from './JobStatus'
import {listJobs, subscribeJobs} from '../api'

export default class JobStatusList extends Component {
  static propTypes = {
    params: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {jobs: [], err: null}
    this._dismissError = this._dismissError.bind(this)
    this._update = this._update.bind(this)
  }

  componentDidMount() {
    this._update()
    this._unsubscribe = subscribeJobs(this._update)
  }

  componentWillUnmount() {
    this._unsubscribe()
  }

  render() {
    const {jobs, err} = this.state
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

          {jobs.length ?
            jobs.map(job => <JobStatus key={job.id} job={job}/>) :
            <li className={styles.placeholder}>You haven't started any jobs yet</li>
          }
        </ul>
      </div>
    )
  }

  _dismissError() {
    console.warn('_dismissError: Not yet implemented')
  }

  _update(err) {
    this.setState({
      err,
      jobs: listJobs()
    })
  }
}

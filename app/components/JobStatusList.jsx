import React, {Component} from 'react'
import {connect} from 'react-redux'
import JobStatus from './JobStatus'
import styles from './JobStatusList.css'

function selector(state) {
  return {
    jobs: state.jobs.records
  }
}

class JobStatusList extends Component {
  static propTypes = {
    jobs: React.PropTypes.array,
    params: React.PropTypes.object
  }

  constructor() {
    super()
    this._dismissError = this._dismissError.bind(this)
  }

  render() {
    const {jobs} = this.props
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
}

export default connect(selector)(JobStatusList)

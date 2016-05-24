import React, {Component} from 'react'
import {Link} from 'react-router'
import styles from './JobStatus.css'
import Timer from './Timestamp.jsx'

const STATUS_RUNNING = 'Running'

export default class JobStatus extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    job: React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      status: React.PropTypes.string
    })
  }

  render() {
    const {job} = this.props
    // TODO -- need to rethink download re: auth
    return (
      <li className={`${styles.root} ${job.status}`}>
        <h2>{job.name}</h2>

        <div className={styles.details}>
          <span className={styles.status}>{job.status}</span>
          {job.status === STATUS_RUNNING && <Timer className={styles.timer} timestamp={job.createdOn}/>}
        </div>

        {job.status === 'Success' && (
          <div className={styles.controls}>
            <Link to={`/jobs/${job.resultId}`}><i className="fa fa-globe"/> View</Link>
            <a download={`${job.name}.geojson`} href={job.geojsonUrl}><i className="fa fa-cloud-download"/> Download</a>
          </div>
        )}
      </li>
    )
  }
}

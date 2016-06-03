import React, {Component} from 'react'
import {Link} from 'react-router'
import Timer from './Timestamp.jsx'
import {serialize} from '../utils/map-anchor'
import styles from './JobStatus.css'

import {
  STATUS_SUCCESS,
  STATUS_RUNNING
} from '../constants'

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
      <li className={styles.root}>
        <Link to={`/?jobId=${job.id}#${serialize(job.bbox)}`} activeClassName={styles.active} className={job.status}>
          <h3>{job.name}</h3>

          <div className={styles.details}>
            <span className={styles.status}>{job.status}</span>
            {job.status === STATUS_RUNNING && <Timer className={styles.timer} timestamp={job.createdOn}/>}
          </div>

          {job.status === STATUS_SUCCESS && (
            <div className={styles.controls}>
              <button className={styles.button} download={`${job.name}.geojson`} href={job.geojsonUrl}>
                <i className="fa fa-cloud-download"/> Download
              </button>
            </div>
          )}
        </Link>
      </li>
    )
  }
}

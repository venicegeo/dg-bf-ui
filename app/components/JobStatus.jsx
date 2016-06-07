import React, {Component} from 'react'
import moment from 'moment'
import {Link} from 'react-router'
import Timer from './Timestamp.jsx'
import {serialize} from '../utils/map-anchor'
import styles from './JobStatus.css'

import {
  STATUS_SUCCESS,
  STATUS_RUNNING,
  STATUS_ERROR,
  STATUS_TIMED_OUT
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

  constructor() {
    super()
    this.state = {isExpanded: false}
    this._handleExpansionToggle = this._handleExpansionToggle.bind(this)
  }

  render() {
    // TODO -- style for "active"
    const {job} = this.props
    return (
      <li className={`${styles.root} ${this._classForStatus} ${this._classForExpansion}`}>
        <div className={styles.details} onClick={this._handleExpansionToggle}>
          <h3 className={styles.title}>
            <i className={`fa fa-chevron-right ${styles.caret}`}/>
            <span>{job.name}</span>
          </h3>

          <div className={styles.summary}>
            <span className={styles.status}>{job.status}</span>
            <Timer className={styles.timer} timestamp={job.createdOn}/>
          </div>

          <div className={styles.metadata}>
            <dl>
              <dt>Image ID</dt>
              <dd>{job.imageId || 'No ID?'}</dd>
              <dt>Algorithm</dt>
              <dd>{job.algorithmName}</dd>
              <dt>Date Started</dt>
              <dd>{moment(job.createdOn).format('llll')}</dd>
            </dl>
          </div>
        </div>

        <div className={styles.controls}>
          <Link to={{pathname: '/',
                     query: {jobId: job.status === STATUS_SUCCESS ? job.id : undefined},
                     hash: '#' + serialize(job.bbox)}}
                title="View on Map">
            <i className="fa fa-globe"/>
          </Link>
          {job.status === STATUS_SUCCESS && (
            <a download={`${job.name}.geojson`} href={job.geojsonUrl} title="Download">
              <i className="fa fa-cloud-download"/>
            </a>
          )}
        </div>

      </li>
    )
  }

  //
  // Internals
  //

  get _classForExpansion() {
    return this.state.isExpanded ? styles.isExpanded : ''
  }

  get _classForStatus() {
    switch (this.props.job.status) {
    case STATUS_SUCCESS: return styles.succeeded
    case STATUS_RUNNING: return styles.running
    case STATUS_TIMED_OUT: return styles.timedOut
    case STATUS_ERROR: return styles.failed
    default: return ''
    }
  }

  _handleExpansionToggle() {
    this.setState({isExpanded: !this.state.isExpanded})
  }
}

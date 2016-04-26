import React, {Component} from 'react';
import styles from './JobStatusList.less';
import JobStatus from './JobStatus'
import {fetchJobs} from '../api';

const SECOND = 1000;
const POLL_INTERVAL = 10 * SECOND;

export default class JobStatusList extends Component {
  static propTypes = {
    params: React.PropTypes.object
  };

  constructor() {
    super();
    this.state = {jobs: []};
    this._checkStatus = this._checkStatus.bind(this);
  }

  componentDidMount() {
    this._activatePolling(POLL_INTERVAL);
  }

  componentWillUnmount() {
    this._deactivatePolling();
  }

  render() {
    return (
      <ul className={styles.root}>
        <li className={styles.header}>Job Statuses</li>
        {this.state.jobs.map(job => <JobStatus className={styles.job} key={job.id} job={job}/>)}
      </ul>
    );
  }

  _activatePolling(interval) {
    console.debug('@job-status-list#_activatePolling', interval);
    this._checkStatus()
      .then(() => {
        this._intervalId = setInterval(this._checkStatus, interval);
      })
      .catch(error => {
        this._deactivatePolling();
        // TODO - disable polling until error is dismissed
        console.error(error);
      });
  }

  _deactivatePolling() {
    console.debug('@job-status-list#_deactivatePolling');
    clearInterval(this._intervalId);
  }

  _checkStatus() {
    return fetchJobs().then(jobs => this.setState({jobs}));
  }
}

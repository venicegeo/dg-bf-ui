import React, {Component} from 'react'
import {Link} from 'react-router'
import {API_NAMESPACE} from '../config'

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
    return (
      <li className={this.props.className}>
        <h3>{job.name} ({job.status})</h3>
        {job.status === 'Success' && <div className="controls">
          <Link to={`/job/${job.resultId}`}>View</Link>
          <a download={`${job.name}.geojson`} href={`${API_NAMESPACE}/results/${job.resultId}`}>Download</a>
        </div>}
      </li>
    )
  }
}

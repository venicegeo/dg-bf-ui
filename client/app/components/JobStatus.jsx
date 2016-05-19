import React, {Component} from 'react'
import {Link} from 'react-router'

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
      <li className={this.props.className}>
        <h3>{job.name} ({job.status})</h3>
        {job.status === 'Success' && <div className="controls">
          <Link to={`/jobs/${job.resultId}`}>View</Link>
          <a download={`${job.name}.geojson`} href={job.geojsonUrl}>Download</a>
        </div>}
      </li>
    )
  }
}

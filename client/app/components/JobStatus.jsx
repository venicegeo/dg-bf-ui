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
    return (
      <li className={this.props.className}>
        <h3>{job.name} ({job.status})</h3>
        {job.status === 'Success' && <Link to={`/job/${job.resultId}`}>View</Link>}
      </li>
    )
  }
}

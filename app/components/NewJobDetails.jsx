import React, {Component} from 'react'
import styles from './NewJobDetails.css'

export default class NewJobDetails extends Component {
  static propTypes = {
    className: React.PropTypes.string
  }

  render() {
    return (
      <div className={styles.root}>
        <h2>Job Details</h2>
        <label className={styles.field}>
          <span>Name</span>
          <input ref="name"/>
        </label>
      </div>
    )
  }
}

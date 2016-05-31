import React, {Component} from 'react'
import {createJob, listAlgorithms, fetchImageList} from '../api'
import styles from './CreateJob.css'

export default class CreateJob extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    params: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {algorithms: [], images: []}
    this._submit = this._submit.bind(this)
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Job</h1>
        </header>
        <ul>
          <li className={styles.placeholder}>
            <h2>Draw bounding box to search for imagery</h2>
            <p>or</p>
            <button className={styles.uploadButton}>
              <i className="fa fa-upload"/> Upload my own image
            </button>
          </li>
        </ul>
      </div>
    )
  }

  _submit(draft) {
    createJob(draft)
      .then(() => {
        // TODO -- flesh out the ideal interaction
        this.context.router.push({pathname: '/jobs'})
      })
      .catch(() => {
        // TODO -- flesh out the ideal interaction
        alert('Submission failed...')  // eslint-disable-line no-alert
      })
  }
}

import React, {Component} from 'react'
// import {createJob, listAlgorithms, fetchImageList} from '../api'
import AlgorithmList from './AlgorithmList'
import ImagerySearch from './ImagerySearch'
import {deserialize} from '../utils/bbox'
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
    this._handleSearchSubmit = this._handleSearchSubmit.bind(this)
  }

  render() {
    const bbox = this._getBoundingBox()
    const imageId = 'DEBUG DEBUG DEBUG'
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Job</h1>
        </header>
        <ul>
          {bbox && <li className={styles.imagery}>
            <ImagerySearch bbox={bbox} onSubmit={this._handleSearchSubmit}/>
          </li>}

          {bbox && imageId && <li className={styles.details}>
            <h2>Job Details</h2>
            <label><span>Name</span><input/></label>
          </li>}

          {bbox && imageId && <li className={styles.algorithms}>
            <AlgorithmList/>
          </li>}

          {!bbox && <li className={styles.placeholder}>
            <h2>Draw bounding box to search for imagery</h2>
            <p>or</p>
            <button className={styles.uploadButton}>
              <i className="fa fa-upload"/> Upload my own image
            </button>
          </li>}
        </ul>
      </div>
    )
  }

  //
  // Internals
  //

  _getBoundingBox() {
    const {bbox} = this.props.params
    return bbox ? deserialize(bbox) : null
  }

  _handleSearchSubmit(data) {
    this.setState({})
    console.warn('search form not yet implemented', data)
  }
}

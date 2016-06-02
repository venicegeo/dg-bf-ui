import React, {Component} from 'react'
import {createJob, searchImagery, listAlgorithms} from '../api'
import AlgorithmList from './AlgorithmList'
import ImagerySearch from './ImagerySearch'
import NewJobDetails from './NewJobDetails'
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
    this.state = {catalogApiKey: '', name: ''}
    this._handleApiKeyChange = this._handleApiKeyChange.bind(this)
    this._handleJobSubmit = this._handleJobSubmit.bind(this)
    this._handleNameChange = this._handleNameChange.bind(this)
    this._handleSearchSubmit = this._handleSearchSubmit.bind(this)
  }

  render() {
    const bbox = this._getBoundingBox()
    const imageId = this.props.params.imageId
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Job</h1>
        </header>
        <ul>
          {bbox && <li className={styles.imagery}>
            <ImagerySearch bbox={bbox}
                           onApiKeyChange={this._handleApiKeyChange}
                           onSubmit={this._handleSearchSubmit}/>
          </li>}

          {bbox && imageId && <li className={styles.details}>
            <NewJobDetails onNameChange={this._handleNameChange}/>
          </li>}

          {bbox && imageId && <li className={styles.algorithms}>
            <AlgorithmList algorithms={listAlgorithms()}
                           onSubmit={this._handleJobSubmit}/>
          </li>}

          {!bbox && <li className={styles.placeholder}>
            <h3>Draw bounding box to search for imagery</h3>
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

  _handleApiKeyChange(catalogApiKey) {
    this.setState({catalogApiKey})
  }

  _handleJobSubmit(algorithm) {
    createJob({
      algorithm,
      catalogApiKey: this.state.catalogApiKey,
      name: this.state.name,
    })
  }

  _handleNameChange(name) {
    this.setState({name})
  }

  _handleSearchSubmit({bbox, dateFrom, dateTo}) {
    searchImagery(this.state.catalogApiKey, bbox, dateFrom, dateTo)
      .then(imagery => {
        console.debug(imagery)
      })
  }
}

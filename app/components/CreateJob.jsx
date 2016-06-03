import React, {Component} from 'react'
import {connect} from 'react-redux'
import AlgorithmList from './AlgorithmList'
import ImagerySearch from './ImagerySearch'
import NewJobDetails from './NewJobDetails'
import {deserialize} from '../utils/bbox'
import {searchImageCatalog} from '../actions'
import styles from './CreateJob.css'

function selector(state) {
  return {
    algorithms: state.algorithms.records,
    imagery: state.imagery
  }
}

class CreateJob extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    algorithms: React.PropTypes.array,
    dispatch: React.PropTypes.func,
    imagery: React.PropTypes.object,
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
    const bbox = deserialize(this.props.params.bbox)
    const selectedImage = this.props.imagery.selection
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Job</h1>
        </header>
        <ul>
          {bbox && <li className={styles.imagery}>
            <ImagerySearch bbox={bbox}
                           error={this.props.imagery.error}
                           isSearching={this.props.imagery.searching}
                           onApiKeyChange={this._handleApiKeyChange}
                           onSubmit={this._handleSearchSubmit}/>
          </li>}

          {bbox && selectedImage && <li className={styles.details}>
            <NewJobDetails onNameChange={this._handleNameChange}/>
          </li>}

          {bbox && selectedImage && <li className={styles.algorithms}>
            <AlgorithmList algorithms={this.props.algorithms}
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
    this.props.dispatch(searchImageCatalog(this.state.catalogApiKey, bbox, dateFrom, dateTo))
  }
}

export default connect(selector)(CreateJob)

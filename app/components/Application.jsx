import React, {Component} from 'react'
import {connect} from 'react-redux'
import Navigation from './Navigation'
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY} from './PrimaryMap'
import {serialize} from '../utils/bbox'
import {startJobsWorker} from '../actions'
import styles from './Application.css'

import store from '../store'

function selector(state) {
  return {
    jobs: state.jobs.records,
    loggedIn: !!state.login.authToken,
    workers: state.workers
  }
}

class Application extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    children: React.PropTypes.element,
    dispatch: React.PropTypes.func,
    jobs: React.PropTypes.array,
    location: React.PropTypes.object,
    loggedIn: React.PropTypes.bool,
    params: React.PropTypes.object,
    workers: React.PropTypes.object
  }

  constructor() {
    super()
    this._handleBoundingBoxChange = this._handleBoundingBoxChange.bind(this)
    this._handleImageSelect = this._handleImageSelect.bind(this)
  }

  componentDidMount() {
    this._startWorkersIfNeeded()
  }

  componentDidUpdate() {
    this._startWorkersIfNeeded()
  }

  render() {
    const datasets = this.props.jobs.map(job => this._generateDataset(job))
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap datasets={datasets}
                    imagery={null}
                    anchor={this.props.location.hash}
                    mode={this._getMapMode()}
                    onBoundingBoxChange={this._handleBoundingBoxChange}
                    onImageSelect={this._handleImageSelect}/>
        {this.props.children}
      </div>
    )
  }

  //
  // Internal API
  //


  _generateDataset(job) {
    // const result = this.state.results[job.id]
    // const progress = this.state.progress[job.id]
    return {job/*, progress, result*/}
  }

  _getMapMode() {
    const {pathname} = this.props.location
    if (pathname.match(/^create-job$/)) {
      return MODE_DRAW_BBOX
    }
    if (pathname.match(/^create-job\//) && this.props.params.bbox) {
      return MODE_SELECT_IMAGERY
    }
    return MODE_NORMAL
  }

  _handleBoundingBoxChange(bbox) {
    this.context.router.push({
      ...this.props.location,
      pathname: `/create-job${bbox ? '/' + serialize(bbox) : ''}`
    })
  }

  _handleImageSelect(imageId) {
    this.context.router.push({
      ...this.props.location,
      pathname: `/create-job/${this.props.params.bbox}${imageId ? '/' + imageId : ''}`
    })
  }

  _startWorkersIfNeeded() {
    const {dispatch, loggedIn, workers} = this.props
    if (!loggedIn) {
      return
    }
    if (!workers.jobs.running) {
      dispatch(startJobsWorker())
    }
  }
}

export default connect(selector)(Application)

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Navigation from './Navigation'
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY} from './PrimaryMap'
import {serialize} from '../utils/bbox'
import {changeLoadedResults, startJobsWorkerIfNeeded} from '../actions'
import styles from './Application.css'

import store from '../store'

function selector(state) {
  return {
    datasets: state.jobs.records.map(job => {
      const result = state.results[job.id]
      return {
        job,
        progress: result ? result.progress : null,
        geojson: result ? result.geojson : null
      }
    }),
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
    datasets: React.PropTypes.array,
    dispatch: React.PropTypes.func,
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
    const {dispatch, location, loggedIn} = this.props
    if (loggedIn) {
      dispatch(startJobsWorkerIfNeeded())
    }
    dispatch(changeLoadedResults(asArray(location.query.jobId)))
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch} = this.props
    if (nextProps.loggedIn) {
      dispatch(startJobsWorkerIfNeeded())
    }
    if (nextProps.location.query.jobId !== this.props.location.query.jobId) {
      dispatch(changeLoadedResults(asArray(nextProps.location.query.jobId)))
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap datasets={this.props.datasets}
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
}

export default connect(selector)(Application)

//
// Internals
//

function asArray(value) {
  if (value) {
    return [].concat(value)
  }
}


import styles from './Application.css'
import React, {Component} from 'react'
import Navigation from './Navigation'
import PrimaryMap, {MODE_DRAW_BBOX, MODE_NORMAL, MODE_SELECT_IMAGERY} from './PrimaryMap'
import {fetchResult, listJobs, subscribeJobs} from '../api'
import {serialize} from '../utils/bbox'

export default class Application extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    params: React.PropTypes.object,
    children: React.PropTypes.element,
    location: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {jobs: [], progress: {}, results: {}}
    this._handleBoundingBoxChange = this._handleBoundingBoxChange.bind(this)
    this._handleImageSelect = this._handleImageSelect.bind(this)
  }

  componentDidMount() {
    this._updateJobs(this.props.location.query.jobId)
    subscribeJobs(() => {
      console.debug('application was notified')
      this._updateJobs(this.props.location.query.jobId)
    })
  }

  componentWillReceiveProps(incomingProps) {
    this._updateJobs(incomingProps.location.query.jobId)
  }

  render() {
    const datasets = this.state.jobs.map(job => this._generateDataset(job))
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap datasets={datasets}
                    imagery={this.state.imagery}
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

  _clearResult(job) {
    this.setState({
      progress: Object.assign({}, this.state.progress, {
        [job.id]: undefined
      }),
      results: Object.assign({}, this.state.results, {
        [job.id]: undefined
      })
    })
  }

  _fetchResult(job) {
    console.debug('(app._fetchResult) -> `%s`', job.id)
    if (this.state.results[job.id]) {
      return  // Nothing to do
    }
    if (this.state.progress[job.id]) {
      return  // Currently loading
    }
    if (!job.resultId) {
      return // No result to load
    }
    // TODO -- it may be time to investigate feasibility of introducing Redux...
    fetchResult(job.resultId, (loaded, total) => {
      this.setState({
        progress: Object.assign({}, this.state.progress, {
          [job.id]: {loaded, total}
        })
      })
    })
      .then(result => {
        this.setState({
          results: Object.assign({}, this.state.results, {
            [job.id]: result.geojson
          })
        })
      })
  }

  _generateDataset(job) {
    const result = this.state.results[job.id]
    const progress = this.state.progress[job.id]
    return {job, progress, result}
  }

  _getMapMode() {
    const {pathname} = this.props.location
    if (pathname.match(/^create-job\/?$/)) {
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
      pathname: `/create-job/${bbox || ''}`
    })
  }

  _handleImageSelect(imageId) {
    this.context.router.push({
      ...this.props.location,
      pathname: `/create-job/${this.props.params.bbox}${imageId ? '/' + imageId : ''}`
    })
  }

  _updateJobs(idsToLoadResultsFor) {
    const jobs = listJobs()
    this.setState({jobs: jobs})

    if (idsToLoadResultsFor) {
      jobs.forEach(job => {
        if (idsToLoadResultsFor.indexOf(job.id) !== -1) {
          this._fetchResult(job)
        } else {
          this._clearResult(job)
        }
      })
    }
  }
}

import styles from './Application.css'
import React, {Component} from 'react'
import Navigation from './Navigation'
import PrimaryMap from './PrimaryMap'
import {fetchResult} from '../api'

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
    this.state = {currentResult: null}
    this._dismissModal = this._dismissModal.bind(this)
  }

  componentDidMount() {
    this._fetchResult(this.props.params.resultId)
  }

  componentWillReceiveProps(incomingProps) {
    this._fetchResult(incomingProps.params.resultId)
  }

  render() {
    const results = []
    if (this.state.currentResult) {
      results.push(this.state.currentResult)
    }
    return (
      <div className={styles.root}>
        <Navigation currentLocation={this.props.location}/>
        <PrimaryMap featureCollections={results}/>
        {this.props.children}
      </div>
    )
  }

  //
  // Internal API
  //

  _fetchResult(resultId) {
    if (resultId) {
      const {currentResult} = this.state
      if (!currentResult || (currentResult && currentResult.id !== resultId)) {
        fetchResult(resultId).then(result => this.setState({currentResult: result}))
      }
    } else {
      this.setState({currentResult: null})
    }
  }

  _dismissModal() {
    this.context.router.push({
      pathname: this.props.location.pathname,
      hash: ''
    })
  }
}

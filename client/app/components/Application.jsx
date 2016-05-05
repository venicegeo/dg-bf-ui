import styles from './Application.less'
import React, {Component} from 'react'
import Navigation from './Navigation'
import MapWidget from './MapWidget'
import Help from './Help'
import About from './About'
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
        <MapWidget featureCollections={results}/>
        {this.props.children}
        {this._showingHelp && <Help dismiss={this._dismissModal}/>}
        {this._showingAbout && <About dismiss={this._dismissModal}/>}
      </div>
    )
  }

  //
  // Internal API
  //

  get _showingAbout() {
    return this.props.location.hash === '#about'
  }

  get _showingHelp() {
    return this.props.location.hash === '#help'
  }

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

import React, {Component} from 'react'
import moment from 'moment'
import styles from './Timestamp.css'

const INTERVAL = 15000

export default class Timestamp extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    timestamp: React.PropTypes.any.isRequired
  }

  constructor() {
    super()
    this.state = {relative: true}
  }

  componentDidMount() {
    this._timer = setInterval(() => this.forceUpdate(), INTERVAL)
  }

  componentWillUnmount() {
    clearInterval(this._timer)
  }

  render() {
    const t = moment(this.props.timestamp)
    const relativeTimestamp = t.fromNow(true)
    const staticTimestamp   = t.format('llll')
    return (
      <span className={`${styles.root} ${this.props.className}`}
            title={this.state.relative ? staticTimestamp : relativeTimestamp}
            onClick={() => this.setState({relative: !this.state.relative})}>
        {this.state.relative ? relativeTimestamp : staticTimestamp}
      </span>
    )
  }
}

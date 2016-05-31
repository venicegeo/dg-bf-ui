import React, {Component} from 'react'
import StaticMinimap from './StaticMinimap'
import styles from './ImagerySearch.css'

export default class ImagerySearch extends Component {
  static propTypes = {
    bbox: React.PropTypes.array,
    onSubmit: React.PropTypes.func
  }

  constructor() {
    super()
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  render() {
    return (
      <form className={styles.root} onSubmit={this._handleSubmit}>
        <h2>Source Imagery</h2>
        <div className={styles.minimap}>
          <StaticMinimap bbox={this.props.bbox}/>
        </div>

        <h3>Date/Time</h3>
        <label className={styles.field}>
          <span>From</span>
          <input type="date" ref="dateFrom" />
        </label>
        <label className={styles.field}>
          <span>To</span>
          <input type="date" ref="dateTo" />
        </label>

        <div className={styles.controls}>
          <button>Search for imagery</button>
        </div>
      </form>
    )
  }

  _handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSubmit({
      bbox: this.props.bbox,
      dateFrom: this.refs.dateFrom.value || null,
      dateTo: this.refs.dateTo.value || null
    })
  }
}

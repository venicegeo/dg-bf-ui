import React, {Component} from 'react'
import moment from 'moment'
import StaticMinimap from './StaticMinimap'
import styles from './ImagerySearch.css'

export default class ImagerySearch extends Component {
  static propTypes = {
    bbox: React.PropTypes.array,
    onApiKeyChange: React.PropTypes.func,
    onSubmit: React.PropTypes.func
  }

  constructor() {
    super()
    this._handleSubmit = this._handleSubmit.bind(this)
    this._handleApiKeyChange = this._handleApiKeyChange.bind(this)
  }

  componentDidMount() {
    this.refs.dateFrom.value = moment().subtract(5, 'days').format('YYYY-MM-DD')
    this.refs.dateTo.value = moment().format('YYYY-MM-DD')
  }

  render() {
    return (
      <form className={styles.root} onSubmit={this._handleSubmit}>
        <h2>Search for Imagery</h2>
        <div className={styles.minimap}>
          <StaticMinimap bbox={this.props.bbox}/>
        </div>

        <h3>Catalog</h3>
        <label className={styles.field}>
          <span>Provider</span>
          <select disabled={true}>
            <option>Planet Labs (LANDSAT)</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>API Key</span>
          <input ref="apiKey" type="password" />
        </label>

        <h3>Date/Time</h3>
        <label className={styles.field}>
          <span>From</span>
          <input ref="dateFrom" type="date" />
        </label>
        <label className={styles.field}>
          <span>To</span>
          <input ref="dateTo" type="date" disabled={true} />
        </label>

        <div className={styles.controls}>
          <button>Search for imagery</button>
        </div>
      </form>
    )
  }

  _handleApiKeyChange() {
    this.props.onApiKeyChange(this.refs.apiKey.value)
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

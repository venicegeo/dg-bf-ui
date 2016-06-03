import React, {Component} from 'react'
import moment from 'moment'
import StaticMinimap from './StaticMinimap'
import styles from './ImagerySearch.css'

export default class ImagerySearch extends Component {
  static propTypes = {
    bbox: React.PropTypes.array,
    error: React.PropTypes.object,
    isSearching: React.PropTypes.bool,
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
    const {error, bbox, isSearching} = this.props
    return (
      <form className={`${styles.root} ${isSearching ? styles.isSearching : ''}`} onSubmit={this._handleSubmit}>
        <h2>Search for Imagery</h2>
        <div className={styles.minimap}>
          <StaticMinimap bbox={bbox}/>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <h4><i className="fa fa-warning"/> Search failed</h4>
            <p>Could not search the image catalog because of an error.</p>
            <pre>{error.stack}</pre>
          </div>
        )}
        <h3>Catalog</h3>
        <label className={styles.field}>
          <span>Provider</span>
          <select disabled={true}>
            <option>Planet Labs (LANDSAT)</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>API Key</span>
          <input ref="apiKey" type="password" disabled={isSearching} />
        </label>

        <h3>Date/Time</h3>
        <label className={styles.field}>
          <span>From</span>
          <input ref="dateFrom" type="date" disabled={isSearching} />
        </label>
        <label className={styles.field}>
          <span>To</span>
          <input ref="dateTo" type="date" disabled={true} />
        </label>

        <div className={styles.controls}>
          <button disabled={isSearching}>Search for imagery</button>
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

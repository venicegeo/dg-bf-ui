import React, {Component} from 'react'
import styles from './NewJobDetails.css'

export default class NewJobDetails extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    onNameChange: React.PropTypes.func
  }

  constructor() {
    super()
    this._handleNameChange = this._handleNameChange.bind(this)
  }

  componentDidMount() {
    this.refs.name.value = 'Beachfront_Job_' + Date.now()
    // HACK
    this._handleNameChange()
    // HACK
  }

  render() {
    return (
      <div className={styles.root}>
        <h2>Job Details</h2>
        <label className={styles.field}>
          <span>Name</span>
          <input ref="name" onChange={this._handleNameChange}/>
        </label>
      </div>
    )
  }

  _handleNameChange() {
    this.props.onNameChange(this.refs.name.value)
  }
}

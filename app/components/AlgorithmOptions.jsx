import React, {Component} from 'react'
import styles from './AlgorithmOptions.css'

export default class AlgorithmOptions extends Component {
  static propTypes = {
    algorithm: React.PropTypes.object,
    children: React.PropTypes.element,
    images: React.PropTypes.array,
    onSubmit: React.PropTypes.func,
    params: React.PropTypes.object
  }

  constructor() {
    super()
    this._onSubmit = this._onSubmit.bind(this)
  }

  componentDidMount() {
    this.refs.name.value = 'Beachfront_Job_' + Date.now()
  }

  render() {
    return (
      <form className={styles.root} onSubmit={this._onSubmit}>
        <h2>Algorithm Options</h2>
        <label className={styles.field}><span>Job Name</span><input ref="name" type="text" placeholder="Enter a name"/></label>

        <label className={styles.field}>
          <span>Image</span>
          <select ref="image">
            {this.props.images.map(image => <option key={image.name} value={image.ids.join(',')}>{image.name}</option>)}
          </select>
        </label>

        <button type="submit">Create Job</button>
      </form>
    )
  }

  _onSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    const draftJob = {
      algorithmId:   this.props.algorithm.id,
      algorithmName: this.props.algorithm.name,
      name:          this.refs.name.value,
      imageIds:      this.refs.image.value.split(',')
    }
    this.props.onSubmit(draftJob)
  }
}

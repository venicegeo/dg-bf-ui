import React, {Component} from 'react'
import styles from './Algorithm.css'

export default class Algorithm extends Component {
  static propTypes = {
    algorithm: React.PropTypes.object,
    imageProperties: React.PropTypes.object,
    onSubmit: React.PropTypes.func
  }

  constructor() {
    super()
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  render() {
    return (
      <form className={styles.root} onSubmit={this._handleSubmit}>
        <h3>{this.props.algorithm.name}</h3>
        <p>{this.props.algorithm.description}</p>

        <div className={styles.controls}>
          <button className={styles.startButton}>Start</button>
        </div>

        <h4>Image Requirements</h4>
        <table className={styles.requirements}>
          <tbody>
          {this.props.algorithm.requirements.map(r => (
            <tr key={r.name}
                className={isCompatible(r, this.props.imageProperties) ? styles.unmet : styles.met}>
              <th>{r.name}</th>
              <td>{r.description}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </form>
    )
  }

  _handleSubmit(event) {
    event.preventDefault()
    this.props.onSubmit(this.props.algorithm)
  }
}

function isCompatible(requirement, imageProperties) {
  switch (requirement.name) {
  case 'Bands':
    return requirement.literal.split(',').every(s => imageProperties.bands[s])
  case 'Cloud Cover':
    return imageProperties.cloudCover < requirement.literal
  default:
    return false
  }
}

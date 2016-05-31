import React, {Component} from 'react'
import styles from './Algorithm.css'

export default class Algorithm extends Component {
  static propTypes = {
    algorithm: React.PropTypes.object
  }

  render() {
    return (
      <form className={styles.root}>
        <h3>{this.props.algorithm.name}</h3>
        <p>{this.props.algorithm.description}</p>

        <div className={styles.controls}>
          <button>Start</button>
        </div>

        <h4>Image Requirements</h4>
        <table>
          <tbody>
          {this.props.algorithm.requirements.map(r => <tr key={r.name}><th>{r.name}</th><td>{r.description}</td></tr>)}
          </tbody>
        </table>
      </form>
    )
  }
}

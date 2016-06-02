import React, {Component} from 'react'
import Algorithm from './Algorithm'
import styles from './AlgorithmList.css'

export default class AlgorithmList extends Component {
  static propTypes = {
    algorithms: React.PropTypes.array,
    className: React.PropTypes.string,
    onSubmit: React.PropTypes.func
  }

  render() {
    return (
      <div className={styles.root}>
        <h2>Select Algorithm</h2>
        <ul>
          {this.props.algorithms.map(algorithm => <li key={algorithm.id}>
            <Algorithm algorithm={algorithm} onSubmit={this.props.onSubmit}/>
          </li>)}
        </ul>
      </div>
    )
  }
}

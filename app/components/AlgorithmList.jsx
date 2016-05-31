import React, {Component} from 'react'
import Algorithm from './Algorithm'
import styles from './AlgorithmList.css'

export default class AlgorithmList extends Component {
  static propTypes = {
    className: React.PropTypes.string
  }

  render() {
    return (
      <div className={styles.root}>
        <h2>Select Algorithm</h2>
        <ul>
          <li>
            <Algorithm algorithm={{name: 'Hardcoded Algo #1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', requirements: [{name: 'Coastline', description: 'Yes'}, {name: 'Cloud Cover', description: 'Less than 10%'}]}}/>
          </li>
          <li>
            <Algorithm algorithm={{name: 'Hardcoded Algo #2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', requirements: [{name: 'Coastline', description: 'Yes'}, {name: 'Cloud Cover', description: 'Less than 10%'}]}}/>
          </li>
        </ul>
      </div>
    )
  }
}

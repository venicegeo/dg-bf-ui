import React, {Component} from 'react'
import styles from './ImageResultsOverlay.css'

export default class ImageResultsOverlay extends Component {
  static propTypes = {
    className: React.PropTypes.string
  }

  render() {
    return (
      <div className={styles.root}>
        <h1>ImageResultsOverlay</h1>
      </div>
    )
  }
}

import React, {Component} from 'react'
import Modal from './Modal'
import styles from './About.css'

export default class About extends Component {
  static propTypes = {
    dismiss: React.PropTypes.func
  }

  render() {
    return (
      <Modal className={styles.root} dismiss={this.props.dismiss}>
        <h1>Welcome to Beachfront</h1>
        <p>Beachfront is an NGA Services project aimed at providing automated near real time feature extraction of global shoreline captured at the best possible resolution based on available sources. Beachfront leverages computer vision algorithm services, the Piazza Platform, and incoming satellite imagery to provide this capability.</p>
      </Modal>
    )
  }
}

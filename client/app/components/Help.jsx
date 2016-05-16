import React, {Component} from 'react'
import Modal from './Modal'
import styles from './Help.css'

export default class Help extends Component {
  static propTypes = {
    dismiss: React.PropTypes.func
  }

  render() {
    return (
      <Modal className={styles.root} dismiss={this.props.dismiss}>
        <h1>Help!</h1>
        <p>Need help?  Let us know we do this stuff for a living... literally!</p>
        <p><a href="mailto:venice@radiantblue.com">venice@radiantblue.com</a></p>
      </Modal>
    )
  }
}

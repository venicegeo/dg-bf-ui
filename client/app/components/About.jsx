import React, {Component} from 'react';
import Modal from './Modal';
import styles from './About.less';

export default class About extends Component {
  static propTypes = {
    dismiss: React.PropTypes.func
  };
  
  render() {
    return (
      <Modal className={styles.root} dismiss={this.props.dismiss}>
        <h1>Welcome to Beachfront</h1>
        <p>This isn't your average sandcastle...</p>
        <p>Beachfront is an application that is dedicated to producing shoreline vector data all over the world as new imagery becomes available. And the best part, it does it automatically while you sit with your toes in the sand.</p>
      </Modal>
    );
  }
}

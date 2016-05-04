import styles from './Navigation.less';
import React, {Component} from 'react';
import {Link} from 'react-router';

export default class Navigation extends Component {
  static propTypes = {
    currentLocation: React.PropTypes.object
  };
  
  render() {
    const {currentLocation} = this.props;
    return (
      <nav className={styles.root}>
        <ul>
          <li className={styles.banner}><Link to="/">Beachfront</Link></li>
          <li><Link to="/job">Job Status</Link></li>
          <li><Link to="/new">Run Algorithm</Link></li>
          <li><Link to={`${currentLocation.pathname}#about`}>About</Link></li>
          <li><Link to={`${currentLocation.pathname}#help`}>Help</Link></li>
        </ul>
      </nav>
    );
  }
}

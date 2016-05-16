import styles from './Navigation.css'
import React, {Component} from 'react'
import Link from 'react-router/lib/Link'

export default class Navigation extends Component {
  static propTypes = {
    currentLocation: React.PropTypes.object
  }
  
  render() {
    const {pathname} = this.props.currentLocation
    return (
      <nav className={styles.root}>
        <ul>
          <li className={styles.banner}><Link to="/">Beachfront</Link></li>
          <li><Link to="/job">Job Status</Link></li>
          <li><Link to="/new">Run Algorithm</Link></li>
          <li><Link to={`${pathname}#about`}>About</Link></li>
          <li><Link to={`${pathname}#help`}>Help</Link></li>
        </ul>
      </nav>
    )
  }
}

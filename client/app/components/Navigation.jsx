import styles from './Navigation.less'
import React, {Component} from 'react'
import Link from 'react-router/lib/Link'
import auth from '../utils/auth'

export default class Navigation extends Component {
  static propTypes = {
    currentLocation: React.PropTypes.object
  }

  constructor () {
    super();
    this.state = {
      loggedIn: null,
    };
    this.updateAuth = this.updateAuth.bind(this);
  }



  updateAuth(loggedIn) {

    this.setState({
      loggedIn: !!loggedIn
    })
  }

  componentWillMount() {
    auth.onChange = this.updateAuth
    auth.login()
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

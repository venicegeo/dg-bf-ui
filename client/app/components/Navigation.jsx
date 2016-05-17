import React, {Component} from 'react'
import Link from 'react-router/lib/Link'
import styles from './Navigation.css'
import brand from '../images/brand-experimental.svg'
import brandSmall from '../images/brand-experimental-small.svg'

export default class Navigation extends Component {
  static propTypes = {
    currentLocation: React.PropTypes.object
  }
  
  render() {
    return (
      <nav className={`${styles.root} ${this.props.currentLocation.pathname === '/' ? styles.atHome : ''}`}>
        <Link to="/about">
          <img className={styles.brand} src={brand} alt="Beachfront"/>
        </Link>
        <ul>
          <li className={styles.home}>
            <Link className={styles.link} to="/">
              <img className={styles.complexIcon} src={brandSmall} alt="Beachfront"/>
              <svg className={styles.icon} viewBox="0 0 30 70"><path d="M3,14.9981077 C3,8.37173577 8.37112582,3 15,3 C21.627417,3 27,8.37134457 27,14.9981077 L27,54.0018923 C27,60.6282642 21.6288742,66 15,66 C8.372583,66 3,60.6286554 3,54.0018923 L3,14.9981077 Z M3,31.1954106 L27,41 L27,36.3445904 L3.00000003,26.5400009 L3,31.1954106 Z" fillRule="evenodd"/></svg>
            </Link>
          </li>
          <li>
            <Link className={styles.link} activeClassName={styles.active} to="/jobs">
              <svg className={styles.icon} viewBox="8 8 24 24"><circle cx="20" cy="20" r="12"/></svg>
              <span className={styles.label}>Jobs</span>
            </Link>
          </li>
          <li>
            <Link className={styles.link} activeClassName={styles.active} to="/create-job">
              <svg className={styles.icon} viewBox="6 6 28 28"><path d="M23,17 L23,6 L17,6 L17,17 L6,17 L6,23 L17,23 L17,34 L23,34 L23,23 L34,23 L34,17 L23,17 Z"/></svg>
              <span className={styles.label}>Create Job</span>
            </Link>
          </li>
          <li>
            <Link className={styles.link} activeClassName={styles.active} to="/about">
              <span className={styles.label}>About</span>
            </Link>
          </li>
          <li>
            <Link className={styles.link} activeClassName={styles.active} to="/help">
              <svg className={styles.icon} viewBox="0 0 40 40"><path d="M20,39 C30.4934102,39 39,30.4934102 39,20 C39,9.50658975 30.4934102,1 20,1 C9.50658975,1 1,9.50658975 1,20 C1,30.4934102 9.50658975,39 20,39 Z M18.1015625,28.2021484 L23.0488281,28.2021484 L23.0488281,33 L18.1015625,33 L18.1015625,28.2021484 Z M15.3457031,9.54199219 C16.6516992,8.70084215 18.2565009,8.28027344 20.1601562,8.28027344 C22.6614708,8.28027344 24.7394123,8.87792371 26.394043,10.0732422 C28.0486736,11.2685607 28.8759766,13.0393763 28.8759766,15.3857422 C28.8759766,16.8245515 28.5162796,18.0364534 27.796875,19.0214844 C27.3763,19.6191436 26.5683654,20.3828079 25.3730469,21.3125 L24.1943359,22.2255859 C23.5524056,22.7236353 23.1263031,23.3046842 22.9160156,23.96875 C22.7832025,24.389325 22.7112631,25.0423133 22.7001953,25.9277344 L18.2177734,25.9277344 C18.28418,24.0572823 18.4612616,22.7651403 18.7490234,22.0512695 C19.0367853,21.3373988 19.7783143,20.5156296 20.9736328,19.5859375 L22.1855469,18.6396484 C22.5839864,18.3408188 22.9049467,18.0143247 23.1484375,17.6601562 C23.591148,17.0514292 23.8125,16.3818396 23.8125,15.6513672 C23.8125,14.8102171 23.566246,14.043786 23.0737305,13.3520508 C22.581215,12.6603156 21.6819727,12.3144531 20.3759766,12.3144531 C19.092116,12.3144531 18.1818061,12.7405556 17.6450195,13.5927734 C17.108233,14.4449912 16.8398438,15.3303991 16.8398438,16.2490234 L12.0419922,16.2490234 C12.1748054,13.0947108 13.2760313,10.8590561 15.3457031,9.54199219 Z" fillRule="evenodd"/></svg>
              <span className={styles.label}>Help</span>
            </Link>
          </li>
        </ul>
      </nav>
    )
  }
}

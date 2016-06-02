import React, {Component} from 'react'
import {connect} from 'react-redux'
import Modal from './Modal'
import styles from './Login.css'
import {logIn} from '../actions'

function selector(state) {
  return {
    error: state.login.error,
    isLoggedIn: !!state.login.authToken,
    verifying: state.login.verifying
  }
}

class Login extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    dismiss: React.PropTypes.func,
    dispatch: React.PropTypes.func.isRequired,
    error: React.PropTypes.bool,
    isLoggedIn: React.PropTypes.bool,
    location: React.PropTypes.object,
    verifying: React.PropTypes.bool
  }

  constructor() {
    super()
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  render() {
    return (
      <Modal className={styles.root} dismiss={this.props.dismiss}>
        <h1>Login</h1><br />
        <form onSubmit={this._handleSubmit}>
          <label><input ref="username" placeholder="username"/></label>&nbsp;&nbsp;
          <label><input ref="pass" placeholder="password" type="password"/></label> <br /><br />
          <button type="submit" disabled={this.props.verifying}>login</button>
          {this.props.error && (
            <p>Bad login information</p>
          )}
        </form>
      </Modal>
    )
  }

  _handleSubmit(event) {
    event.preventDefault()
    const username = this.refs.username.value
    const password = this.refs.pass.value
    this.props.dispatch(logIn(username, password))
      .then(() => {
        const {router} = this.context
        const {location} = this.props
        if (location.state && location.state.nextPathname) {
          router.replace(location.state.nextPathname)
        } else {
          router.replace('/')
        }
      })
  }
}

export default connect(selector)(Login)

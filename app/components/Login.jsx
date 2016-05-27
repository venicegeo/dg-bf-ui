import React, {Component} from 'react'
import Modal from './Modal'
import {login} from '../api'
import styles from './Login.css'

export default class Login extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    dismiss: React.PropTypes.func,
    router: React.PropTypes.object,
    location: React.PropTypes.object
  }

  constructor() {
    super()
    this.state = {error: null}
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  render() {
    return (
            <Modal className={styles.root} dismiss={this.props.dismiss}>
                <h1>Login</h1><br />
                <form onSubmit={this._handleSubmit}>
                    <label><input ref="username" placeholder="username" /></label>&nbsp;&nbsp;
                    <label><input ref="pass" placeholder="password" type="password" /></label> <br /><br />
                    <button type="submit">login</button>
                    {this.state.error && (
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
    login(username, password)
      .then(() => {
        const {router} = this.context
        const {location} = this.props
        if (location.state && location.state.nextPathname) {
          router.replace(location.state.nextPathname)
        } else {
          router.replace('/')
        }
      })
      .catch(err => {
        this.setState({error: true})
        console.error('Authentication failed', err)
      })
  }
}

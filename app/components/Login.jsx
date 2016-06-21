/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Modal from './Modal'
import styles from './Login.css'
import {authenticate} from '../actions'

class Login extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    authenticating: React.PropTypes.bool.isRequired,
    dispatch:       React.PropTypes.func.isRequired,
    error:          React.PropTypes.any,
    location:       React.PropTypes.object.isRequired
  }

  constructor() {
    super()
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  componentDidMount() {
    this.refs.username.focus()
  }

  render() {
    return (
      <Modal className={styles.root} onDismiss={() => {}}>
        <h1>Login</h1><br />
        <form onSubmit={this._handleSubmit}>
          <label><input ref="username" placeholder="username"/></label>&nbsp;&nbsp;
          <label><input ref="pass" placeholder="password" type="password"/></label> <br /><br />
          <button type="submit" disabled={this.props.authenticating}>login</button>
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
    this.props.dispatch(authenticate(username, password))
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

export default connect(state => ({
  authenticating: state.authentication.authenticating,
  error:          state.authentication.error
}))(Login)

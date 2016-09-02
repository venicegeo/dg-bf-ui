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

const styles: any = require('./Login.css')
const brand: string = require('../images/brand-small.svg')

import * as React from 'react'
import {Modal} from './Modal'
import {createSession} from '../api/authentication'

interface Props {
  onError(error: any)
  onSuccess(sessionToken: string)
}

export class Login extends React.Component<Props, {}> {
  refs: any

  constructor() {
    super()
    this.state = {error: null, authenticating: false}
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    this.refs.username.focus()
  }

  render() {
    return (
      <Modal onDismiss={() => {}}>
        <form className={`${styles.root} ${this.state.error ? styles.failed : ''}`} onSubmit={this.handleSubmit}>
          <img src={brand} alt="Beachfront"/>
          <h1>Welcome to Beachfront!</h1>
          <p>Please enter your username and password to login.</p>
          {this.state.error && (
            <div className={styles.errorMessage}>Oh no, login failed! ({this.state.error.message})</div>
          )}
          <div className={styles.fields}>
            <label><input ref="username" placeholder="username"/></label>
            <label><input ref="pass" placeholder="password" type="password"/></label>
          </div>
          <button className={styles.submitButton} type="submit" disabled={this.state.authenticating}>login</button>
        </form>
      </Modal>
    )
  }

  private handleSubmit(event) {
    event.preventDefault()
    const username = this.refs.username.value
    const password = this.refs.pass.value
    createSession(username, password)
      .then(token => {
        this.props.onSuccess(token)
      })
      .catch(err => {
        console.error(err.stack)
        this.setState({ error: err })
      })
  }
}

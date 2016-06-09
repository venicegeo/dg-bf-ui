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

export default class Modal extends Component {
  static propTypes = {
    children: React.PropTypes.oneOfType([
      React.PropTypes.element,
      React.PropTypes.arrayOf(React.PropTypes.element)
    ]).isRequired,
    className: React.PropTypes.string,
    onDismiss: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    document.addEventListener('click', this.props.onDismiss)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.props.onDismiss)
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    )
  }
}

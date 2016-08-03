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

const styles: any = require('./About.css')

import * as React from 'react'
import Modal from './Modal'

interface Props {
  location: any
}

export default class About extends React.Component<Props, {}> {
  static contextTypes: React.ValidationMap<any> = {
    router: React.PropTypes.object,
  }

  context: any

  render() {
    return (
      <Modal className={styles.root} onDismiss={() => this.dismiss()}>
        <h1>Welcome to Beachfront</h1>
        <p>Beachfront is an NGA Services project aimed at providing automated near real time feature extraction of global shoreline captured at the best possible resolution based on available sources. Beachfront leverages computer vision algorithm services, the Piazza Platform, and incoming satellite imagery to provide this capability.</p>
      </Modal>
    )
  }

  private dismiss() {
    const {hash, query} = this.props.location
    this.context.router.push({hash, query, pathname: '/'})
  }
}

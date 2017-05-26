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

const styles = require('./UpdateAvailable.css')

import * as React from 'react'
import {Modal} from './Modal'

interface Props {
  onDismiss()
}

export const UpdateAvailable = ({ onDismiss }: Props) => (
  <Modal onDismiss={onDismiss} onInitialize={() => {/* noop */}}>
    <div className={styles.root}>
      <h1><i className="fa fa-ship"/> CoastLine has been updated!</h1>
      <p>
        A new version of CoastLine is available.  Reload the page to see the latest version.
      </p>

      <p className={styles.instructions}>
        <a className={styles.updateButton} href="/" onClick={(e) => e.stopPropagation()}>
          <i className="fa fa-refresh"/> Update Now
        </a>
        …or click anywhere or press <kbd>ESC</kbd> to close this message
      </p>
    </div>
  </Modal>
)

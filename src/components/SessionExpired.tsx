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

const styles = require('./SessionExpired.css')

import * as React from 'react'
import {Modal} from './Modal'

interface Props {
  onDismiss()
}

export const SessionExpired = ({ onDismiss }: Props) => (
  <Modal onDismiss={onDismiss} onInitialize={() => {/* noop */}}>
    <div className={styles.root}>
      <h1><i className="fa fa-lock"/> Your session has expired</h1>
      <p>This happens if you've been idle for a while or if Beachfront has been upgraded after you logged in.</p>
      <p className={styles.instructions}>
        Click anywhere or press <kbd>ESC</kbd> to close this message
      </p>
    </div>
  </Modal>
)

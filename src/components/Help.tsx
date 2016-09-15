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

const styles: any = require('./Help.css')

import * as React from 'react'
import {Modal} from './Modal'

interface Props {
  onDismiss()
}

export const Help = ({ onDismiss }: Props) => (
  <Modal onDismiss={onDismiss}>
    <div className={styles.root}>
      <h1>Help!</h1>
      <p>Need help?  Let us know we do this stuff for a living... literally!</p>
      <p><a href="mailto:venice@radiantblue.com">venice@radiantblue.com</a></p>
    </div>
  </Modal>
)

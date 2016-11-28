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

import * as axios from 'axios'

let instance

export function start({
  interval,
  onAvailable,
}: Params) {
  if (typeof instance === 'number') {
    throw new Error('Attempted to start while already running')
  }
  instance = setInterval(() => {
    console.debug('(update:worker) checking for updates to the UI')
    axios.get<Document>('/', {responseType: 'document'})
      .then(response => {
        if (getVersion(response.data) !== getVersion(document)) {
          onAvailable()
        }
      })
      .catch(err => {
        console.error('(update:worker) failed:', err)
      })
  }, interval)
}

export function terminate() {
  if (typeof instance !== 'number') {
    return  // Nothing to do
  }

  console.debug('(update:worker) terminating')
  clearInterval(instance)
  instance = null
}

interface Params {
  interval: number
  onAvailable(): void
}

//
// Internals
//

function getVersion(dom: Document) {
  return dom.documentElement.getAttribute('data-build')
}

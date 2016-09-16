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

import {Client} from './piazza-client'
import {GATEWAY, HEARTBEAT_INTERVAL} from '../config'

let instance

export function start({ sessionToken, onSessionExpired, onUpdateAvailable }) {
  if (typeof instance === 'number') {
    throw new Error('Cannot start heartbeat twice')
  }

  console.debug('(heartbeat.start)')

  const client = new Client(GATEWAY, sessionToken)
  instance = setInterval(() => {
    console.debug('(heartbeat:tick)')
    isCurrentVersion().then(current => {
      if (!current) {
        onUpdateAvailable()
      }
    })

    client.isSessionActive().then(active => {
      if (!active) {
        onSessionExpired()
      }
    })
    // Check session
  }, HEARTBEAT_INTERVAL)
}

export function stop() {
  console.debug('(heartbeat.stop)')
  clearInterval(instance)
  instance = null
}

//
// Internals
//

function isCurrentVersion() {
  return fetch('/', { cache: 'reload' })
    .then(response => response.text())
    .then(markup => new DOMParser().parseFromString(markup, 'text/html'))
    .then(dom => getVersion(dom) === getVersion(document))
}

function getVersion(dom: Document) {
  return dom.documentElement.getAttribute('data-build')
}

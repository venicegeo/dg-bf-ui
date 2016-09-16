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

import {Client} from '../utils/piazza-client'
import * as worker from './workers/session'
import {GATEWAY, SESSION_WORKER} from '../config'

let client: Client

export function create(username, password): Promise<void> {
  return Client.create(GATEWAY, username, password)
    .then(instance => {
      client = instance
      serializeToken(client.sessionToken)
    })
    .catch(err => {
      console.error('(session:create) authentication failed')
      throw err
    })
}

export function getClient(): Client {
  if (client) {
     return client
  }

  const token = deserializeToken()
  if (token) {
    return client = new Client(GATEWAY, token)
  }

  throw new Error('No session exists')
}

export function exists() {
  return !!client || !!deserializeToken()
}

export function destroy() {
  client = null
  serializeToken(null)
}

export function startWorker({ onExpired }) {
  worker.start({
    client,
    interval: SESSION_WORKER.INTERVAL,
    onExpired,
  })
}

export function stopWorker() {
  worker.terminate()
}

//
// Internals
//

function serializeToken(token) {
  sessionStorage.setItem('token', token || '')
}

function deserializeToken() {
  return sessionStorage.getItem('token') || null
}

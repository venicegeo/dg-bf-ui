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

import {Client} from '../../utils/piazza-client'

let instance

export function start({
  client,
  interval,
  onExpired,
}: Params) {
  if (typeof instance === 'number') {
    throw new Error('Cannot start heartbeat twice')
  }

  instance = setInterval(() => {
    console.debug('(session:worker) validating session')
    client.isSessionActive().then(active => !active && onExpired())
  }, interval)
}

export function terminate() {
  if (typeof instance !== 'number') {
    return  // Nothing to do
  }

  console.debug('(session:worker) terminating')
  clearInterval(instance)
  instance = null
}

interface Params {
  client: Client
  interval: number
  onExpired(): void
}

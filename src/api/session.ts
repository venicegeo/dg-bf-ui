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

import axios, {AxiosInstance} from 'axios'
import * as worker from './workers/session'
import {API_ROOT, SESSION_WORKER_INTERVAL} from '../config'

const DEFAULT_TIMEOUT = 18000

let _client: AxiosInstance

export function destroy(): void {
  _client = null
  sessionStorage.clear()
}

export function initialize(): boolean {

  // User has already logged on
  const timestamp = sessionStorage.getItem('__timestamp__')
  if (timestamp) {
    return true
  }

    // User has been redirected back from bf-api
  if (location.search.indexOf('logged_in=true') !== -1) {
    sessionStorage.setItem('__timestamp__', new Date().toISOString())

    const entry = sessionStorage.getItem('__entry__')
    sessionStorage.removeItem('__entry__')

    // Return to original destination
    history.replaceState(null, null, entry)
    return true
  }

  // Save search for later
  sessionStorage.setItem('__entry__', location.pathname + location.search.replace(/\blogged_in=true&?/, ''))

  return false
}

export function getClient(reuse = true): AxiosInstance {
  if (!_client || !reuse) {
    _client = axios.create({
      baseURL: API_ROOT,
      timeout: DEFAULT_TIMEOUT,
      withCredentials: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  }
  return _client
}

export function startWorker({ onExpired }) {
  worker.start({
    client:   getClient(),
    interval: SESSION_WORKER_INTERVAL,
    onExpired,
  })
}

export function stopWorker() {
  worker.terminate()
}

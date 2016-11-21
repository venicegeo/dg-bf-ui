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
import * as worker from './workers/session'
import {API_ROOT, SESSION_WORKER_INTERVAL} from '../config'

const DEFAULT_TIMEOUT = 6000

let _client: Axios.AxiosInstance

export function create(username, password): Promise<void> {
  return axios.post(`${API_ROOT}/login`, null, {auth: {username, password}})
    .then((response: any) => {
      _client = axios.create({
        baseURL: API_ROOT,
        timeout: DEFAULT_TIMEOUT,
        auth: {
          username: response.data.api_key,
          password: '',
        },
      })
      sessionStorage.setItem('apiKey', response.data.api_key)
    })
    .catch(err => {
      console.error('(session:create) authentication failed')
      throw err
    })
}

export function destroy() {
  _client = null
  sessionStorage.clear()
}

export function exists() {
  return !!_client || !!sessionStorage.getItem('apiKey')
}

export function getClient(): Axios.AxiosInstance {
  if (_client) {
     return _client
  }

  const apiKey = sessionStorage.getItem('apiKey')
  if (apiKey) {
    _client = axios.create({
      baseURL: API_ROOT,
      timeout: DEFAULT_TIMEOUT,
      auth: {
        username: apiKey,
        password: '',
      },
    })
    return _client
  }

  throw new Error('No session exists')
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

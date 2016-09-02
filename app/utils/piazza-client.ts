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

export const STATUS_RUNNING = 'Running'
export const STATUS_SUCCESS = 'Success'
export const STATUS_ERROR   = 'Error'

interface ProgressNotifier {
  (notification: {cancel(), loaded: number, total: number}): void
}

export class Client {
  gateway: string
  authToken: string

  static createSessionToken(gateway, username, password) {
    return fetch(`${gateway}/key`, {
      method:  'GET',
      headers: {
        'Authorization': `Basic ${btoa(username + ':' + password)}`,
      },
    })
      .then(asJson)
      .then(auth => {
        if (!auth.uuid) {
          throw new Error('Credentials rejected')
        }
        return `Basic ${btoa(auth.uuid + ':')}`
      })
  }

  constructor(gateway, authToken) {
    this.gateway   = gateway.replace(/\/+$/g, '')
    this.authToken = authToken
  }

  getDeployment(id) {
    return this.fetch(`/deployment/${id}`)
      .then(asJson)
      .then(normalizeDeployment)
  }

  getFile(id, onProgress?: ProgressNotifier) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', encodeURI(`${this.gateway}/file/${id}`))
      xhr.setRequestHeader('authorization', this.authToken)
      xhr.addEventListener('error', () => reject(new Error('Network error')))
      let canceled = false
      if (onProgress) {
        xhr.addEventListener('progress', event => {
          onProgress({
            cancel() {
              if (!canceled) {
                canceled = true
                xhr.abort()
              }
            },
            loaded: event.loaded,
            total: event.total,
          })
        })
      }
      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState !== 4) {
          return
        }

        if (canceled) {
          reject({isCancellation: true})
          return
        }

        if (xhr.status !== 200) {
          reject(httpError({status: xhr.status}))
          return
        }

        resolve(xhr.responseText)
      })
      xhr.send(null)
    })
  }

  getServices({pattern}) {
    return this.fetch(`/service?keyword=${pattern}&per_page=100`)
      .then(asJson)
      .then(normalizeServiceListing)
  }

  getStatus(jobId) {
    return this.fetch(`/job/${jobId}`)
      .then(asJson)
      .then(normalizeStatus)
  }

  post(type, data) {
    return this.fetch('/job', {
      body: JSON.stringify({type, data}),
      headers: {'content-type': 'application/json'},
      method: 'POST',
    })
      .then(asJson)
      .then(normalizePostMetadata)
  }

  private fetch(endpoint, overrides: any = {}) {
    const options = Object.assign({}, overrides, {
      headers: Object.assign({}, overrides.headers, {
        'authorization': this.authToken,
      }),
    })
    return fetch(encodeURI(this.gateway + endpoint), options)
  }
}

//
// Internals
//

function asJson(response) {
  if (!response.ok) {
    throw httpError(response)
  }
  return response.json()
}

function normalizeDeployment(descriptor) {
  return {
    dataId:   descriptor.data.deployment.dataId,
    endpoint: descriptor.data.deployment.capabilitiesUrl.replace(/\?.*$/, ''),
    layerId:  descriptor.data.deployment.layer,
  }
}

function normalizePostMetadata(metadata) {
  if (!metadata.data.jobId) {
    throw invalidResponse(metadata, 'No job ID assigned')
  }
  return metadata.data.jobId
}

function normalizeServiceListing(page) {
  return page.data
}

function normalizeStatus(status) {
  if (!status.data || !status.data.status || status.type === 'error') {
    throw invalidResponse(status, status.message || 'Status is ambiguous')
  }
  return Object.assign({
    message: null,
    result: null,
  }, status.data)
}

//
// Errors
//

function invalidResponse(contents, message) {
  const err: any = new Error(`InvalidResponse: ${message} (${JSON.stringify(contents)})`)
  err.contents = contents
  return err
}

function httpError(response) {
  const err: any = new Error(`HttpError: (code=${response.status})`)
  err.status = response.status
  return err
}

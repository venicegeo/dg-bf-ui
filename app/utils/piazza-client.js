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

export class Client {
  static createSessionToken(gateway, username, password) {
    return fetch(`${gateway}/key`, {
      method:  'GET',
      headers: {
        'Authorization': `Basic ${btoa(username + ':' + password)}`
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
    return this._fetch(`/deployment/${id}`)
      .then(asJson)
      .then(normalizeDeployment)
  }

  getFile(id, onProgress) {
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
            total: event.total
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
          reject(new HttpError({status: xhr.status}))
          return
        }

        resolve(xhr.responseText)
      })
      xhr.send(null)
    })
  }

  getServices({pattern}) {
    return this._fetch(`/service?keyword=${pattern}&per_page=100`)
      .then(asJson)
      .then(normalizeServiceListing)
  }

  getStatus(jobId) {
    return this._fetch(`/job/${jobId}`)
      .then(asJson)
      .then(normalizeStatus)
  }

  post(type, data) {
    return this._fetch('/job', {
      body: JSON.stringify({type, data}),
      headers: {'content-type': 'application/json'},
      method: 'POST'
    })
      .then(asJson)
      .then(normalizePostMetadata)
  }

  _fetch(endpoint, overrides = {}) {
    const options = Object.assign({}, overrides, {
      headers: Object.assign({}, overrides.headers, {
        'authorization': this.authToken
      })
    })
    return fetch(encodeURI(this.gateway + endpoint), options)
  }
}

//
// Internals
//

function asJson(response) {
  if (!response.ok) {
    throw new HttpError(response)
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
    throw new InvalidResponse(metadata, 'No job ID assigned')
  }
  return metadata.data.jobId
}

function normalizeServiceListing(page) {
  return page.data
}

function normalizeStatus(status) {
  if (!status.data || !status.data.status || status.type === 'error') {
    throw new InvalidResponse(status, status.message || 'Status is ambiguous')
  }
  return Object.assign({
    message: null,
    result: null
  }, status.data)
}

//
// Errors
//

class HttpError extends Error {
  constructor(response) {
    super(`HttpError: (code=${response.status})`)
    this.status = response.status
  }
}

class InvalidResponse extends Error {
  constructor(contents, message) {
    super(`InvalidResponse: ${message} (${JSON.stringify(contents)})`)
    this.contents = contents
  }
}

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
  constructor(gateway, authToken) {
    this.gateway   = gateway.replace(/\/+$/g, '')
    this.authToken = authToken
  }

  getDeployment(id) {
    return this._fetch(`/deployment/${id}`)
      .then(asJson)
      .then(normalizeDeployment)
  }

  getFile(id, progress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', encodeURI(`${this.gateway}/file/${id}`))
      xhr.setRequestHeader('authorization', this.authToken)
      xhr.addEventListener('error', () => reject(new Error('Network error')))
      if (progress) {
        xhr.addEventListener('progress', event => progress(event.loaded, event.total))
      }
      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText)
            return
          }
          reject(new HttpError({status: xhr.status}))
        }
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
    return this._fetch('/v2/job', {
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
    dataId:   descriptor.dataId,
    endpoint: descriptor.capabilitiesUrl.replace(/\?.*$/, ''),
    layerId:  'piazza:' + descriptor.layer,
  }
}

function normalizePostMetadata(metadata) {
  if (!metadata.jobId) {
    throw new InvalidResponse(metadata, 'No job ID assigned')
  }
  return metadata.jobId
}

function normalizeServiceListing(page) {
  return page.data
}

function normalizeStatus(status) {
  if (!status.status || status.type === 'error') {
    throw new InvalidResponse(status, status.message || 'Status is ambiguous')
  }
  return Object.assign({
    message: null,
    result: null
  }, status)
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

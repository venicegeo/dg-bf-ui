export const STATUS_RUNNING = 'Running'
export const STATUS_SUCCESS = 'Success'
export const STATUS_ERROR = 'Error'

export class Client {
  constructor(gateway, authToken) {
    this.gateway = gateway.replace(/\/+$/g, '')
    this.authToken = authToken
  }

  getFile(id) {
    return this._fetch(`/file/${id}`)
      .then(asText)
  }

  getServices({pattern}) {
    return this._fetch(`/service?keyword=${pattern}&per_page=100`)
      .then(asJson)
      .then(page => page.data)
  }
  
  getStatus(jobId) {
    return this._fetch(`/job/${jobId}`)
      .then(asJson)
      .then(status => {
        if (!status.status || status.type === 'error') {
          throw new InvalidResponse(status, status.message || 'Status is ambiguous')
        }
        return Object.assign({
          message: null,
          result: null
        }, status)
      })
  }

  post(type, data) {
    return this._fetch('/v2/job', {
      method: 'POST',
      body: JSON.stringify({type, data}),
      headers: {
        'content-type': 'application/json'
      }
    })
      .then(asJson)
      .then(metadata => {
        if (!metadata.jobId) {
          throw new InvalidResponse(metadata, 'No job ID assigned')
        }
        return metadata.jobId
      })
  }

  _fetch(endpoint, overrides = {}) {
    const options = Object.assign({}, overrides, {
      headers: Object.assign({}, overrides.headers, {
        'authorization': this.authToken
      })
    })
    return fetch(`${this.gateway}${endpoint}`, options)
  }
}

//
// Helpers
//

function asJson(response) {
  if (!response.ok) {
    throw new HttpError(response)
  }
  return response.json()
}

function asText(response) {
  if (!response.ok) {
    throw new HttpError(response)
  }
  return response.text()
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

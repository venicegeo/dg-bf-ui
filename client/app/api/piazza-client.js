export const STATUS_RUNNING = 'Running'
export const STATUS_SUCCESS = 'Success'
export const STATUS_ERROR = 'Error'

export class Client {
  constructor(gateway) {
    this.gateway = gateway.replace(/\/+$/g, '')
  }

  getFile(id) {
    return fetch(`${this.gateway}/file/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new HttpError(response)
        }
        return response.text()
      })
  }

  getServices({pattern}) {
    return fetch(`${this.gateway}/service?keyword=${pattern}&per_page=100`)
      .then(response => {
        if (!response.ok) {
          throw new HttpError(response)
        }
        return response.json()
      })
      .then(page => page.data)
  }
  
  getStatus(jobId) {
    return fetch(`${this.gateway}/job/${jobId}`)
      .then(response => {
        if (!response.ok) {
          throw new HttpError(response)
        }
        return response.json()
      })
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
    const message = {type, data}
    return fetch(`${this.gateway}/v2/job`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'content-type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new HttpError(response)
        }
        return response.json()
      })
      .then(metadata => {
        if (!metadata.jobId) {
          throw new InvalidResponse(metadata, 'No job ID assigned')
        }
        return metadata.jobId
      })
  }
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

function generateError(response) {
  return response.json().then(payload => {
    const error = new Error(payload.message || '')

  })
}

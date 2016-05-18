export class Client {
  constructor(gateway) {
    this.gateway = gateway.replace(/\/+$/g, '')
  }

  getFile(id) {
    return fetch(`${this.gateway}/file/${id}`)
      .then(response => {
        if (response.ok) {
          return response.text()
        }
        throw new HttpError(response)
      })
  }

  getServices({pattern}) {
    return fetch(`${this.gateway}/service?keyword=${pattern}&per_page=100`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new HttpError(response)
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

export function getAuthToken() {
  return sessionStorage.getItem('authToken')
}

export function login(gateway, username, password) {
  return fetch(gateway.replace('pz-gateway.', 'pz-security.') + '/verification', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({username, credential: password})
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid user credentials')
      }
      return response.text()
    })
    .then(token => {

      // HACK HACK HACK HACK
      if (token === 'false') {
        throw new Error('Invalid user credentials')
      }
      token = `Basic ${btoa(username + ':' + password)}`
      // HACK HACK HACK HACK

      sessionStorage.setItem('authToken', token)
      return token
    })
}

import {Client} from './piazza-client'

const PZ_FILE_RESPONSE = `{
  "foo": "bar"
}`

const PZ_AUTH_ERROR_RESPONSE = `HTTP Status 401 - pz-gateway is unable to authenticate the provided user`

const PZ_FILE_ERROR_RESPONSE = `{
  "timestamp": 1461978715800,
  "status": 500,
  "error": "Internal Server Error",
  "exception": "java.lang.Exception",
  "message": "Error downloading file for Data test-id by user UNAUTHENTICATED: 500 Internal Server Error",
  "path": "/file/test-id"
}`

const PZ_SERVICE_RESPONSE = `{
  "type": "service-list",
  "data": [
    {
      "serviceId": "test-id-1",
      "url": "test-url",
      "resourceMetadata": {
        "name": "test-name",
        "description": "test-description",
        "method": "POST",
        "availability": "test-availability"
      }
    },
    {
      "serviceId": "test-id-2",
      "url": "test-url",
      "resourceMetadata": {
        "name": "test-name",
        "description": "test-description",
        "method": "POST",
        "availability": "test-availability"
      }
    }
  ],
  "pagination": {
    "count": 2,
    "page": 0,
    "per_page": 100
  }
}`

describe('Piazza Client', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 500

  describe('constructor()', () => {
    it('can instantiate', () => {
      expect(() => new Client('http://test-gateway')).not.toThrow()
    })

    it('normalizes gateway', () => {
      const client = new Client('http://test-gateway//////')
      expect(client.gateway).toEqual('http://test-gateway')
    })
  })

  describe('getFile()', () => {
    it ('calls correct URL', (done) => {
      const stub = spyOn(window, 'fetch').and.returnValue(resolve(PZ_FILE_RESPONSE))
      const client = new Client('http://m')
      client.getFile('test-id')
        .then(() => {
          expect(stub).toHaveBeenCalledWith('http://m/file/test-id')
          done()
        })
        .catch(done.fail)
    })

    it('can retrieve file', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(PZ_FILE_RESPONSE))
      const client = new Client('http://m')
      client.getFile('test-id')
        .then(content => {
          expect(content).toBeTruthy()
          done()
        })
        .catch(done.fail)
    })

    it('does not modify payload', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(PZ_FILE_RESPONSE))
      const client = new Client('http://m')
      client.getFile('test-id')
        .then(actual => {
          expect(actual).toEqual(PZ_FILE_RESPONSE)
          done()
        })
        .catch(done.fail)
    })

    it('handles HTTP errors gracefully', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolveJson(PZ_FILE_ERROR_RESPONSE, 500))
      const client = new Client('http://m')
      client.getFile('test-id')
        .then(() => done.fail('Should have thrown'))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
    })
  })
  
  describe('getServices()', () => {
    it ('calls correct URL', (done) => {
      const stub = spyOn(window, 'fetch').and.returnValue(resolve(PZ_SERVICE_RESPONSE))
      const client = new Client('http://m')
      client.getServices({pattern: 'test-pattern'})
        .then(() => {
          expect(stub).toHaveBeenCalledWith('http://m/service?keyword=test-pattern&per_page=100')
          done()
        })
        .catch(done.fail)
    })

    it('can list services', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolveJson(PZ_SERVICE_RESPONSE))
      const client = new Client('http://m')
      client.getServices({pattern: 'test-pattern'})
        .then(services => {
          expect(services instanceof Array).toEqual(true)
          expect(services.length).toEqual(2)
          done()
        })
        .catch(done.fail)
    })

    it('deserializes metadata', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolveJson(PZ_SERVICE_RESPONSE))
      const client = new Client('http://m')
      client.getServices({pattern: 'test-pattern'})
        .then(([firstService]) => {
          expect(firstService.serviceId).toEqual('test-id-1')
          expect(firstService.resourceMetadata.availability).toEqual('test-availability')
          expect(firstService.resourceMetadata.description).toEqual('test-description')
          expect(firstService.resourceMetadata.name).toEqual('test-name')
          done()
        })
        .catch(done.fail)
    })

    it('handles HTTP errors gracefully', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(PZ_AUTH_ERROR_RESPONSE, 500))
      const client = new Client('http://m')
      client.getServices({pattern: 'test-pattern'})
        .then(() => done.fail('Should have thrown'))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
    })
  })
})

//
// Helpers
//

function resolve(content, status = 200, type = 'text/plain') {
  return Promise.resolve(new Response(content, {
    status,
    headers: {
      'content-type': type
    }
  }))
}

function resolveJson(string, status = 200) {
  return resolve(string, status, 'application/json')
}

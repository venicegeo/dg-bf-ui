import {Client, STATUS_ERROR, STATUS_RUNNING, STATUS_SUCCESS} from './piazza-client'

const ERROR_UNAUTHORIZED = 'HTTP Status 401 - pz-gateway is unable to authenticate the provided user'

const ERROR_GENERIC = `{
  "timestamp": 1461978715800,
  "status": 500,
  "error": "Internal Server Error",
  "exception": "java.lang.NullPointerException",
  "message": "No message available",
  "path": "/any/where"
}`

const RESPONSE_FILE = `{
  "foo": "bar"
}`

const RESPONSE_JOB_CREATED = `{
  "type": "job",
  "jobId": "test-id"
}`

const RESPONSE_JOB_RUNNING = `{
  "type": "status",
  "jobId": "test-id",
  "status": "Running",
  "jobType": "execute-service",
  "submittedBy": "test-user",
  "progress": {}
}`

const RESPONSE_JOB_SUCCESS = `{
  "type": "status",
  "jobId": "test-id",
  "result": {
    "type": "data",
    "dataId": "test-data-id"
  },
  "status": "Success",
  "jobType": "execute-service",
  "submittedBy": "test-user",
  "progress": {}
}`

const RESPONSE_JOB_ERROR = `{
  "type": "status",
  "jobId": "test-id",
  "result": {
    "type": "error",
    "message": "Service not found."
  },
  "status": "Error",
  "jobType": "execute-service",
  "submittedBy": "test-user",
  "progress": {}
}`

const RESPONSE_JOB_NOT_FOUND = `{
  "type": "error",
  "jobId": "test-id",
  "message": "Job Not Found.",
  "origin": "Job Manager"
}`

const RESPONSE_SERVICE_LIST = `{
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

    it('normalizes auth token', () => {
      const client = new Client('http://test-gateway', 'test-auth-token')
      expect(client.authToken).toEqual('test-auth-token')
    })
  })

  describe('getFile()', () => {
    it ('calls correct URL', (done) => {
      const stub = spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_FILE))
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(() => {
          expect(stub.calls.first().args[0]).toEqual('http://m/file/test-id')
          done()
        })
        .catch(done.fail)
    })

    it('can retrieve file', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_FILE))
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(content => {
          expect(content).toBeTruthy()
          done()
        })
        .catch(done.fail)
    })

    it('does not modify payload', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_FILE))
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(actual => {
          expect(actual).toEqual(RESPONSE_FILE)
          done()
        })
        .catch(done.fail)
    })

    it('handles HTTP errors gracefully', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolveJson(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
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
      const stub = spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(() => {
          expect(stub.calls.first().args[0]).toEqual('http://m/service?keyword=test-pattern&per_page=100')
          done()
        })
        .catch(done.fail)
    })

    it('can list services', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(services => {
          expect(services instanceof Array).toEqual(true)
          expect(services.length).toEqual(2)
          done()
        })
        .catch(done.fail)
    })

    it('deserializes metadata', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
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
      spyOn(window, 'fetch').and.returnValue(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(() => done.fail('Should have thrown'))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
    })
  })

  describe('getStatus()', () => {
    it('calls correct URL', (done) => {
      const stub = spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => {
          expect(stub.calls.first().args[0]).toEqual('http://m/job/test-id')
          done()
        })
        .catch(done.fail)
    })

    it('properly deserializes running job', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_RUNNING)
          expect(status.result).toBeNull()
          done()
        })
        .catch(done.fail)
    })

    it('properly deserializes successful job', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_SUCCESS))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_SUCCESS)
          expect(status.result.dataId).toEqual('test-data-id')
          done()
        })
        .catch(done.fail)
    })

    it('properly deserializes failed job', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_ERROR))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_ERROR)
          expect(status.result.dataId).toBeUndefined()
          done()
        })
        .catch(done.fail)
    })

    it('properly handles non-existent job', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_NOT_FOUND))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => done.fail('Should have thrown'))
        .catch(error => {
          expect(error instanceof Error).toEqual(true)
          expect(error.message).toMatch(/^InvalidResponse: Job Not Found/i)
          done()
        })
    })

    it('handles HTTP errors gracefully', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => done.fail('Should have thrown'))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
    })
  })

  describe('post()', () => {
    it('calls correct URL', (done) => {
      const stub = spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          expect(stub.calls.first().args[0]).toEqual('http://m/v2/job')
          done()
        })
        .catch(done.fail)
    })

    it('returns new job ID', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(id => {
          expect(id).toEqual('test-id')
          done()
        })
        .catch(done.fail)
    })

    it('properly serializes message', (done) => {
      const stub = spyOn(window, 'fetch').and.returnValue(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          const [, options] = stub.calls.first().args
          expect(options.method).toEqual('POST')
          expect(options.headers['content-type']).toEqual('application/json')
          expect(options.body).toEqual('{"type":"test-type","data":"test-data"}')
          done()
        })
        .catch(done.fail)
    })

    it('handles HTTP errors gracefully', (done) => {
      spyOn(window, 'fetch').and.returnValue(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
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

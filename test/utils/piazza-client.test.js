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

import expect from 'expect'
import sinon from 'sinon'
import {Client, STATUS_ERROR, STATUS_RUNNING, STATUS_SUCCESS} from 'app/utils/piazza-client'
import {
  ERROR_GENERIC,
  RESPONSE_DEPLOYMENT,
  RESPONSE_DEPLOYMENT_NOT_FOUND,
  RESPONSE_FILE,
  RESPONSE_JOB_CREATED,
  RESPONSE_JOB_RUNNING,
  RESPONSE_JOB_SUCCESS,
  RESPONSE_JOB_ERROR,
  RESPONSE_JOB_NOT_FOUND,
  RESPONSE_SERVICE_LIST
} from '../fixtures/piazza-responses'

describe('Piazza Client', function () {
  this.timeout(500)

  afterEach(() => expect.restoreSpies())

  describe('constructor()', () => {
    it('can instantiate', () => {
      expect(() => new Client('http://test-gateway')).toNotThrow()
    })

    it('normalizes gateway', () => {
      const client = new Client('http://test-gateway//////')
      expect(client.gateway).toEqual('http://test-gateway')
    })

    it('normalizes auth token', () => {
      const client = new Client('http://test-gateway', 'test-auth-token')
      expect(client.sessionToken).toEqual('test-auth-token')
    })
  })

  describe('getDeployment()', () => {
    it('calls correct URL', () => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      return client.getDeployment('test-deployment-id')
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/deployment/test-deployment-id')
        })
    })

    it('properly deserializes GeoServer deployment descriptor', () => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      return client.getDeployment('test-deployment-id')
        .then(descriptor => {
          expect(descriptor.dataId).toEqual('test-data-id')
          expect(descriptor.endpoint).toEqual('http://test-capabilities-url/arbitrary/context/path')
          expect(descriptor.layerId).toEqual('test-layer-id')
        })
    })

    it('handles HTTP errors gracefully', () => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_DEPLOYMENT_NOT_FOUND, 500))
      const client = new Client('http://m', 'test-auth-token')
      return client.getDeployment('nopenope')
        .then(
          () => { throw new Error('Should have thrown') },
          err => {
            expect(err.status).toEqual(500)
          })
    })
  })

  describe('getFile()', () => {
    let server

    beforeEach(() => server = sinon.fakeServer.create({autoRespond: true}))
    afterEach(() => server.restore())

    it('calls correct URL', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id')
        .then(() => {
          expect(server.requests[0].method).toEqual('GET')
          expect(server.requests[0].url).toEqual('http://m/file/test-id')
        })
    })

    it('can retrieve file', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id')
        .then(content => {
          expect(content).toBeTruthy()
        })
    })

    it('does not modify payload', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id')
        .then(actual => {
          expect(actual).toEqual(RESPONSE_FILE)
        })
    })

    it.skip('handles HTTP errors gracefully', () => {
      /*
       Disabling this test due to a bug in the current version of sinon that causes the
       fake XHR to emit an error event on any non-200 HTTP status code.

       Refer to: https://github.com/sinonjs/sinon/pull/1031
       */
      server.respondWith([500, {}, ERROR_GENERIC])
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id')
        .then(() => { throw new Error('Should have thrown') })
        .catch(error => {
          expect(error.status).toEqual(500)
        })
    })

    it('notifies callers of progress', () => {
      server.respondWith([200, {'content-length': RESPONSE_FILE.length}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      const stub = sinon.stub()
      return client.getFile('test-id', stub)
        .then(() => {
          expect(stub.called).toBeTruthy()
          expect(stub.alwaysCalledWithMatch(sinon.match({
            loaded: sinon.match.number,
            total: sinon.match.number,
          }))).toBeTruthy()
        })
    })

    it('allows callers to cancel a retrieval', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const stub = sinon.stub()
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id', stub)
        .then(() => {
          expect(stub.alwaysCalledWithMatch({
            cancel: sinon.match.func
          })).toBeTruthy()
        })
    })

    it('on cancellation, rejects promise', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const onProgress = ({cancel}) => cancel()
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id', onProgress)
        .then(() => { throw new Error('Should have rejected') })
        .catch(err => {
          expect(err).toEqual({isCancellation: true})
        })
    })

    it('on cancellation, halts the XHR', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const onProgress = ({cancel}) => cancel()
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id', onProgress)
        .catch(() => {
          expect(server.requests[0].aborted).toBe(true)
        })
    })
  })

  describe('getServices()', () => {
    it('calls correct URL', () => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/service?keyword=test-pattern&per_page=100')
        })
    })

    it('can list services', () => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(services => {
          expect(services instanceof Array).toEqual(true)
          expect(services.length).toEqual(2)
        })
    })

    it('deserializes metadata', () => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(([firstService]) => {
          expect(firstService.serviceId).toEqual('test-id-1')
          expect(firstService.resourceMetadata.classType).toEqual({classification: 'UNCLASSIFIED'})
          expect(firstService.resourceMetadata.description).toEqual('test-description')
          expect(firstService.resourceMetadata.name).toEqual('test-name')
          expect(firstService.resourceMetadata.version).toEqual('test-version')
        })
    })

    it('handles HTTP errors gracefully', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(
          () => { throw new Error('Should have thrown') },
          error => {
            expect(error.status).toEqual(500)
          })
    })
  })

  describe('getStatus()', () => {
    it('calls correct URL', () => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/job/test-id')
        })
    })

    it('properly deserializes running job', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_RUNNING)
          expect(status.result).toEqual(null)
        })
    })

    it('properly deserializes successful job', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_SUCCESS))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_SUCCESS)
          expect(status.result.dataId).toEqual('test-data-id')
        })
    })

    it('properly deserializes failed job', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_ERROR))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_ERROR)
          expect(status.result.dataId).toNotExist()
        })
    })

    it('properly handles non-existent job', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_NOT_FOUND))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(
          () => { throw new Error('Should have thrown') },
          error => {
            expect(error).toBeAn(Error)
            expect(error.message).toMatch(/^InvalidResponse: Job Not Found/i)
          })
    })

    it('handles HTTP errors gracefully', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(
          () => { throw new Error('Should have thrown') },
          error => {
            expect(error.status).toEqual(500)
          })
    })
  })

  describe('post()', () => {
    it('calls correct URL', () => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/job')
        })
    })

    it('returns new job ID', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(id => {
          expect(id).toEqual('test-id')
        })
    })

    it('properly serializes message', () => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          const [, options] = stub.calls[0].arguments
          expect(options.method).toEqual('POST')
          expect(options.headers['content-type']).toEqual('application/json')
          expect(options.body).toEqual('{"type":"test-type","data":"test-data"}')
        })
    })

    it('handles HTTP errors gracefully', () => {
      expect.spyOn(window, 'fetch').andReturn(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(
          () => { throw new Error('Should have thrown') },
          error => {
            expect(error.status).toEqual(500)
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

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
import {Client, STATUS_ERROR, STATUS_RUNNING, STATUS_SUCCESS} from './piazza-client'
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
} from '../../test/fixtures/piazza-responses'

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
      expect(client.authToken).toEqual('test-auth-token')
    })
  })

  describe('getDeployment()', () => {
    it('calls correct URL', (done) => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      client.getDeployment('test-deployment-id')
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/deployment/test-deployment-id')
          done()
        })
        .catch(done)
    })

    it('properly deserializes GeoServer deployment descriptor', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      client.getDeployment('test-deployment-id')
        .then(descriptor => {
          expect(descriptor.dataId).toEqual('test-data-id')
          expect(descriptor.endpoint).toEqual('http://test-capabilities-url/arbitrary/context/path')
          expect(descriptor.layerId).toEqual('test-layer-id')
          done()
        })
        .catch(done)
    })

    it('handles HTTP errors gracefully', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_DEPLOYMENT_NOT_FOUND, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getDeployment('nopenope')
        .then(() => done(new Error('Should have thrown')))
        .catch(err => {
          expect(err.status).toEqual(500)
          done()
        })
        .catch(done)
    })
  })

  describe('getFile()', () => {
    let server

    beforeEach(() => server = sinon.fakeServer.create({autoRespond: true}))
    afterEach(() => server.restore())

    it('calls correct URL', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(() => {
          expect(server.requests[0].method).toEqual('GET')
          expect(server.requests[0].url).toEqual('http://m/file/test-id')
          done()
        })
        .catch(done)
    })

    it('can retrieve file', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(content => {
          expect(content).toBeTruthy()
          done()
        })
        .catch(done)
    })

    it('does not modify payload', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(actual => {
          expect(actual).toEqual(RESPONSE_FILE)
          done()
        })
        .catch(done)
    })

    it.skip('handles HTTP errors gracefully', (done) => {
      /*
       Disabling this test due to a bug in the current version of sinon that causes the
       fake XHR to emit an error event on any non-200 HTTP status code.

       Refer to: https://github.com/sinonjs/sinon/pull/1031
       */
      server.respondWith([500, {}, ERROR_GENERIC])
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
        .catch(done)
    })

    it('notifies callers of progress', (done) => {
      server.respondWith([200, {'content-length': RESPONSE_FILE.length}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      const stub = sinon.stub()
      client.getFile('test-id', stub)
        .then(() => {
          expect(stub.called).toBeTruthy()
          expect(stub.alwaysCalledWithMatch(sinon.match({
            loaded: sinon.match.number,
            total: sinon.match.number,
          }))).toBeTruthy()
          done()
        })
        .catch(done)
    })

    it('allows callers to cancel a retrieval', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const stub = sinon.stub()
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id', stub)
        .then(() => {
          expect(stub.alwaysCalledWithMatch({
            cancel: sinon.match.func
          })).toBeTruthy()
          done()
        })
        .catch(done)
    })

    it('on cancellation, rejects promise', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const onProgress = ({cancel}) => cancel()
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id', onProgress)
        .then(() => done(new Error('Should have rejected')))
        .catch(err => {
          expect(err).toEqual({isCancellation: true})
          done()
        })
        .catch(done)
    })

    it('on cancellation, halts the XHR', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const onProgress = ({cancel}) => cancel()
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id', onProgress)
        .catch(() => {
          expect(server.requests[0].aborted).toBe(true)
          done()
        })
        .catch(done)
    })
  })

  describe('getServices()', () => {
    it('calls correct URL', (done) => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/service?keyword=test-pattern&per_page=100')
          done()
        })
        .catch(done)
    })

    it('can list services', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(services => {
          expect(services instanceof Array).toEqual(true)
          expect(services.length).toEqual(2)
          done()
        })
        .catch(done)
    })

    it('deserializes metadata', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(([firstService]) => {
          expect(firstService.serviceId).toEqual('test-id-1')
          expect(firstService.resourceMetadata.classType).toEqual({classification: 'UNCLASSIFIED'})
          expect(firstService.resourceMetadata.description).toEqual('test-description')
          expect(firstService.resourceMetadata.name).toEqual('test-name')
          expect(firstService.resourceMetadata.version).toEqual('test-version')
          done()
        })
        .catch(done)
    })

    it('handles HTTP errors gracefully', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
        .catch(done)
    })
  })

  describe('getStatus()', () => {
    it('calls correct URL', (done) => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/job/test-id')
          done()
        })
        .catch(done)
    })

    it('properly deserializes running job', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_RUNNING)
          expect(status.result).toEqual(null)
          done()
        })
        .catch(done)
    })

    it('properly deserializes successful job', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_SUCCESS))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_SUCCESS)
          expect(status.result.dataId).toEqual('test-data-id')
          done()
        })
        .catch(done)
    })

    it('properly deserializes failed job', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_ERROR))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          expect(status.jobId).toEqual('test-id')
          expect(status.status).toEqual(STATUS_ERROR)
          expect(status.result.dataId).toNotExist()
          done()
        })
        .catch(done)
    })

    it('properly handles non-existent job', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_NOT_FOUND))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          expect(error instanceof Error).toEqual(true)
          expect(error.message).toMatch(/^InvalidResponse: Job Not Found/i)
          done()
        })
    })

    it('handles HTTP errors gracefully', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
        .catch(done)
    })
  })

  describe('post()', () => {
    it('calls correct URL', (done) => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          expect(stub.calls[0].arguments[0]).toEqual('http://m/v2/job')
          done()
        })
        .catch(done)
    })

    it('returns new job ID', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(id => {
          expect(id).toEqual('test-id')
          done()
        })
        .catch(done)
    })

    it('properly serializes message', (done) => {
      const stub = expect.spyOn(window, 'fetch').andReturn(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          const [, options] = stub.calls[0].arguments
          expect(options.method).toEqual('POST')
          expect(options.headers['content-type']).toEqual('application/json')
          expect(options.body).toEqual('{"type":"test-type","data":"test-data"}')
          done()
        })
        .catch(done)
    })

    it('handles HTTP errors gracefully', (done) => {
      expect.spyOn(window, 'fetch').andReturn(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          expect(error.status).toEqual(500)
          done()
        })
        .catch(done)
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

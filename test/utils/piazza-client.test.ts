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

import {assert} from 'chai'
import * as sinon from 'sinon'
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
  RESPONSE_SERVICE_LIST,
} from '../fixtures/piazza-responses'

describe('Piazza Client', function () {
  let fetchStub: Sinon.SinonStub

  this.timeout(500)

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch')
  })

  afterEach(() => {
    fetchStub.restore()
  })

  describe('constructor()', () => {
    it('can instantiate', () => {
      assert.doesNotThrow(() => {
        new Client('http://test-gateway', 'test-auth-token')
      })
    })

    it('normalizes gateway', () => {
      const client = new Client('http://test-gateway//////', 'test-auth-token')
      assert.equal(client.gateway, 'http://test-gateway')
    })

    it('normalizes auth token', () => {
      const client = new Client('http://test-gateway', 'test-auth-token')
      assert.equal(client.authToken, 'test-auth-token')
    })
  })

  describe('getDeployment()', () => {
    it('calls correct URL', (done) => {
      const stub = fetchStub.returns(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      client.getDeployment('test-deployment-id')
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/deployment/test-deployment-id')
          done()
        })
        .catch(done)
    })

    it('properly deserializes GeoServer deployment descriptor', (done) => {
      fetchStub.returns(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      client.getDeployment('test-deployment-id')
        .then(descriptor => {
          assert.equal(descriptor.dataId, 'test-data-id')
          assert.equal(descriptor.endpoint, 'http://test-capabilities-url/arbitrary/context/path')
          assert.equal(descriptor.layerId, 'test-layer-id')
          done()
        })
        .catch(done)
    })

    it('handles HTTP errors gracefully', (done) => {
      fetchStub.returns(resolveJson(RESPONSE_DEPLOYMENT_NOT_FOUND, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getDeployment('nopenope')
        .then(() => done(new Error('Should have thrown')))
        .catch(err => {
          assert.equal(err.status, 500)
          done()
        })
        .catch(done)
    })
  })

  describe('getFile()', () => {
    let server

    beforeEach(() => {
      server = sinon.fakeServer.create()
      server.autoRespond = true
    })

    afterEach(() => {
      server.restore()
    })

    it('calls correct URL', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(() => {
          assert.equal(server.requests[0].method, 'GET')
          assert.equal(server.requests[0].url, 'http://m/file/test-id')
          done()
        })
        .catch(done)
    })

    it('can retrieve file', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(content => {
          assert.ok(content)
          done()
        })
        .catch(done)
    })

    it('does not modify payload', (done) => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id')
        .then(actual => {
          assert.equal(actual, RESPONSE_FILE)
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
          assert.equal(error.status, 500)
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
          assert.isTrue(stub.called)
          assert.isTrue(stub.alwaysCalledWithMatch(sinon.match({
            loaded: sinon.match.number,
            total: sinon.match.number,
          })))
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
          assert.isTrue(stub.alwaysCalledWithMatch({
            cancel: sinon.match.func,
          }))
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
          assert.deepEqual(err, {isCancellation: true})
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
          assert.isTrue(server.requests[0].aborted)
          done()
        })
        .catch(done)
    })
  })

  describe('getServices()', () => {
    it('calls correct URL', (done) => {
      const stub = fetchStub.returns(resolve(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/service?keyword=test-pattern&per_page=100')
          done()
        })
        .catch(done)
    })

    it('can list services', (done) => {
      fetchStub.returns(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(services => {
          assert.instanceOf(services, Array)
          assert.equal(services.length, 2)
          done()
        })
        .catch(done)
    })

    it('deserializes metadata', (done) => {
      fetchStub.returns(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(([firstService]) => {
          assert.equal(firstService.serviceId, 'test-id-1')
          assert.deepEqual(firstService.resourceMetadata.classType, {classification: 'UNCLASSIFIED'})
          assert.equal(firstService.resourceMetadata.description, 'test-description')
          assert.equal(firstService.resourceMetadata.name, 'test-name')
          assert.equal(firstService.resourceMetadata.version, 'test-version')
          done()
        })
        .catch(done)
    })

    it('handles HTTP errors gracefully', (done) => {
      fetchStub.returns(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getServices({pattern: 'test-pattern'})
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          assert.equal(error.status, 500)
          done()
        })
        .catch(done)
    })
  })

  describe('getStatus()', () => {
    it('calls correct URL', (done) => {
      const stub = fetchStub.returns(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/job/test-id')
          done()
        })
        .catch(done)
    })

    it('properly deserializes running job', (done) => {
      fetchStub.returns(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          assert.equal(status.jobId, 'test-id')
          assert.equal(status.status, STATUS_RUNNING)
          assert.equal(status.result, null)
          done()
        })
        .catch(done)
    })

    it('properly deserializes successful job', (done) => {
      fetchStub.returns(resolve(RESPONSE_JOB_SUCCESS))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          assert.equal(status.jobId, 'test-id')
          assert.equal(status.status, STATUS_SUCCESS)
          assert.equal(status.result.dataId, 'test-data-id')
          done()
        })
        .catch(done)
    })

    it('properly deserializes failed job', (done) => {
      fetchStub.returns(resolve(RESPONSE_JOB_ERROR))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(status => {
          assert.equal(status.jobId, 'test-id')
          assert.equal(status.status, STATUS_ERROR)
          assert.isUndefined(status.result.dataId)
          done()
        })
        .catch(done)
    })

    it('properly handles non-existent job', (done) => {
      fetchStub.returns(resolve(RESPONSE_JOB_NOT_FOUND))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          assert.instanceOf(error, Error)
          assert.match(error.message, /^InvalidResponse: Job Not Found/i)
          done()
        })
        .catch(done)
    })

    it('handles HTTP errors gracefully', (done) => {
      fetchStub.returns(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.getStatus('test-id')
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          assert.equal(error.status, 500)
          done()
        })
        .catch(done)
    })
  })

  describe('post()', () => {
    it('calls correct URL', (done) => {
      const stub = fetchStub.returns(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/job')
          done()
        })
        .catch(done)
    })

    it('returns new job ID', (done) => {
      fetchStub.returns(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(id => {
          assert.equal(id, 'test-id')
          done()
        })
        .catch(done)
    })

    it('properly serializes message', (done) => {
      const stub = fetchStub.returns(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => {
          const [, options] = stub.firstCall.args
          assert.equal(options.method, 'POST')
          assert.equal(options.headers['content-type'], 'application/json')
          assert.equal(options.body, '{"type":"test-type","data":"test-data"}')
          done()
        })
        .catch(done)
    })

    it('handles HTTP errors gracefully', (done) => {
      fetchStub.returns(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(() => done(new Error('Should have thrown')))
        .catch(error => {
          assert.equal(error.status, 500)
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
    headers: new Headers({
      'content-type': type,
    }),
  }))
}

function resolveJson(serialized: string, status = 200) {
  return resolve(serialized, status, 'application/json')
}

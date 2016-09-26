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
import {Client, STATUS_ERROR, STATUS_RUNNING, STATUS_SUCCESS} from '../../src/utils/piazza-client'
import {
  ERROR_GENERIC,
  RESPONSE_AUTH_REJECTED,
  RESPONSE_AUTH_SUCCESS,
  RESPONSE_AUTH_ACTIVE,
  ERROR_AUTH,
  RESPONSE_AUTH_EXPIRED,
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
      assert.equal(client.sessionToken, 'test-auth-token')
    })
  })

  describe('create()', () => {
    it('calls correct URL', () => {
      const stub = fetchStub.returns(resolveJson(RESPONSE_AUTH_SUCCESS, 201))
      return Client.create('http://m', 'test-username', 'test-password')
        .then(token => {
          assert.equal(stub.firstCall.args[0], 'http://m/key')
        })
    })

    it('passes correct credentials', () => {
      const stub = fetchStub.returns(resolveJson(RESPONSE_AUTH_SUCCESS, 201))
      return Client.create('http://m', 'test-username', 'test-password')
        .then(token => {
          assert.equal(stub.firstCall.args[1].headers['Authorization'], 'Basic dGVzdC11c2VybmFtZTp0ZXN0LXBhc3N3b3Jk')
        })
    })

    it('yields a valid client instance', () => {
      fetchStub.returns(resolveJson(RESPONSE_AUTH_SUCCESS, 201))
      return Client.create('http://m', 'test-username', 'test-password')
        .then(instance => {
          assert.instanceOf(instance, Client)
          assert.equal(instance.gateway, 'http://m')
          assert.equal(instance.sessionToken, 'Basic dGVzdC1zb21lLXV1aWQ6')
        })
    })

    it('throws if credentials are rejected', () => {
      fetchStub.returns(resolveJson(RESPONSE_AUTH_REJECTED, 401))
      return Client.create('http://m', 'test-username', 'test-password')
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
            assert.instanceOf(err, Error)
            assert.equal(err.status, 401)
        })
    })

    it('handles HTTP errors gracefully', () => {
      fetchStub.returns(resolveJson(ERROR_GENERIC, 500))
      return Client.create('http://m', 'test-username', 'test-password')
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
            assert.instanceOf(err, Error)
            assert.equal(err.status, 500)
        })
    })
  })

  describe('isSessionActive', () => {
    it('calls correct URL', () => {
      const stub = fetchStub.returns(resolveJson(RESPONSE_AUTH_ACTIVE))
      const client = new Client('http://pz-gateway.m', 'Basic dGVzdC1hdXRoLXRva2VuOg==')
      return client.isSessionActive()
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://pz-idam.m/v2/verification')
        })
    })

    it('sends correct payload', () => {
      const stub = fetchStub.returns(resolveJson(RESPONSE_AUTH_ACTIVE))
      const client = new Client('http://pz-gateway.m', 'Basic dGVzdC1hdXRoLXRva2VuOg==')
      return client.isSessionActive()
        .then(() => {
          assert.equal(stub.firstCall.args[1].body, '{"uuid":"test-auth-token"}')
        })
    })

    it('returns false if expired', () => {
      fetchStub.returns(resolveJson(RESPONSE_AUTH_EXPIRED))
      const client = new Client('http://pz-gateway.m', 'Basic dGVzdC1hdXRoLXRva2VuOg==')
      return client.isSessionActive()
        .then(isActive => {
          assert.isFalse(isActive)
        })
    })

    it('returns true if not expired', () => {
      fetchStub.returns(resolveJson(RESPONSE_AUTH_ACTIVE))
      const client = new Client('http://pz-gateway.m', 'Basic dGVzdC1hdXRoLXRva2VuOg==')
      return client.isSessionActive()
        .then(isActive => {
          assert.isTrue(isActive)
        })
    })

    it('handles HTTP errors gracefully', () => {
      fetchStub.returns(resolveJson(ERROR_AUTH, 500))
      const client = new Client('http://pz-gateway.m', 'Basic dGVzdC1hdXRoLXRva2VuOg==')
      return client.isSessionActive()
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
          assert.instanceOf(err, Error)
          assert.equal(err.status, 500)
        })
    })
  })

  describe('getDeployment()', () => {
    it('calls correct URL', () => {
      const stub = fetchStub.returns(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      return client.getDeployment('test-deployment-id')
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/deployment/test-deployment-id')
        })
    })

    it('properly deserializes GeoServer deployment descriptor', () => {
      fetchStub.returns(resolveJson(RESPONSE_DEPLOYMENT))
      const client = new Client('http://m', 'test-auth-token')
      return client.getDeployment('test-deployment-id')
        .then(descriptor => {
          assert.equal(descriptor.dataId, 'test-data-id')
          assert.equal(descriptor.endpoint, 'http://test-capabilities-url/arbitrary/context/path')
          assert.equal(descriptor.layerId, 'test-layer-id')
        })
    })

    it('handles HTTP errors gracefully', () => {
      fetchStub.returns(resolveJson(RESPONSE_DEPLOYMENT_NOT_FOUND, 500))
      const client = new Client('http://m', 'test-auth-token')
      return client.getDeployment('nopenope')
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
            assert.equal(err.status, 500)
          }
        )
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

    it('calls correct URL', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id')
        .then(() => {
          assert.equal(server.requests[0].method, 'GET')
          assert.equal(server.requests[0].url, 'http://m/file/test-id')
        })
    })

    it('can retrieve file', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id')
        .then(content => {
          assert.ok(content)
        })
    })

    it('does not modify payload', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id')
        .then(actual => {
          assert.equal(actual, RESPONSE_FILE)
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
          assert.equal(error.status, 500)
        })
    })

    it('notifies callers of progress', () => {
      server.respondWith([200, {'content-length': RESPONSE_FILE.length}, RESPONSE_FILE])
      const client = new Client('http://m', 'test-auth-token')
      const stub = sinon.stub()
      return client.getFile('test-id', stub)
        .then(() => {
          assert.isTrue(stub.called)
          assert.isTrue(stub.alwaysCalledWithMatch(sinon.match({
            loaded: sinon.match.number,
            total: sinon.match.number,
          })))
        })
    })

    it('allows callers to cancel a retrieval', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const stub = sinon.stub()
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id', stub)
        .then(() => {
          assert.isTrue(stub.alwaysCalledWithMatch({
            cancel: sinon.match.func,
          }))
        })
    })

    it('on cancellation, rejects promise', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const onProgress = ({cancel}) => cancel()
      const client = new Client('http://m', 'test-auth-token')
      return client.getFile('test-id', onProgress)
        .then(() => { throw new Error('Should have rejected') })
        .catch(err => {
          assert.deepEqual(err, {isCancellation: true})
        })
    })

    it('on cancellation, halts the XHR', () => {
      server.respondWith([200, {}, RESPONSE_FILE])
      const onProgress = ({cancel}) => cancel()
      const client = new Client('http://m', 'test-auth-token')
      client.getFile('test-id', onProgress)
        .catch(() => {
          assert.isTrue(server.requests[0].aborted)
        })
    })
  })

  describe('getServices()', () => {
    it('calls correct URL', () => {
      const stub = fetchStub.returns(resolve(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/service?keyword=test-pattern&per_page=100')
        })
    })

    it('can list services', () => {
      fetchStub.returns(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(services => {
          assert.instanceOf(services, Array)
          assert.equal(services.length, 2)
        })
    })

    it('deserializes metadata', () => {
      fetchStub.returns(resolveJson(RESPONSE_SERVICE_LIST))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(([firstService]) => {
          assert.equal(firstService.serviceId, 'test-id-1')
          assert.deepEqual(firstService.resourceMetadata.classType, {classification: 'UNCLASSIFIED'})
          assert.equal(firstService.resourceMetadata.description, 'test-description')
          assert.equal(firstService.resourceMetadata.name, 'test-name')
          assert.equal(firstService.resourceMetadata.version, 'test-version')
        })
    })

    it('handles HTTP errors gracefully', () => {
      fetchStub.returns(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      return client.getServices({pattern: 'test-pattern'})
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
            assert.equal(err.status, 500)
          })
    })
  })

  describe('getStatus()', () => {
    it('calls correct URL', () => {
      const stub = fetchStub.returns(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/job/test-id')
        })
    })

    it('properly deserializes running job', () => {
      fetchStub.returns(resolve(RESPONSE_JOB_RUNNING))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(status => {
          assert.equal(status.jobId, 'test-id')
          assert.equal(status.status, STATUS_RUNNING)
          assert.equal(status.result, null)
        })
    })

    it('properly deserializes successful job', () => {
      fetchStub.returns(resolve(RESPONSE_JOB_SUCCESS))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(status => {
          assert.equal(status.jobId, 'test-id')
          assert.equal(status.status, STATUS_SUCCESS)
          assert.equal(status.result.dataId, 'test-data-id')
        })
    })

    it('properly deserializes failed job', () => {
      fetchStub.returns(resolve(RESPONSE_JOB_ERROR))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(status => {
          assert.equal(status.jobId, 'test-id')
          assert.equal(status.status, STATUS_ERROR)
          assert.isUndefined(status.result.dataId)
        })
    })

    it('properly handles non-existent job', () => {
      fetchStub.returns(resolve(RESPONSE_JOB_NOT_FOUND))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
            assert.instanceOf(err, Error)
            assert.match(err.message, /^InvalidResponse: Job Not Found/i)
          })
    })

    it('handles HTTP errors gracefully', () => {
      fetchStub.returns(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      return client.getStatus('test-id')
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
            assert.equal(err.status, 500)
          })
    })
  })

  describe('post()', () => {
    it('calls correct URL', () => {
      const stub = fetchStub.returns(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      return client.post('test-type', 'test-data')
        .then(() => {
          assert.equal(stub.firstCall.args[0], 'http://m/job')
        })
    })

    it('returns new job ID', () => {
      fetchStub.returns(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(id => {
          assert.equal(id, 'test-id')
        })
    })

    it('properly serializes message', () => {
      const stub = fetchStub.returns(resolve(RESPONSE_JOB_CREATED))
      const client = new Client('http://m', 'test-auth-token')
      return client.post('test-type', 'test-data')
        .then(() => {
          const [, options] = stub.firstCall.args
          assert.equal(options.method, 'POST')
          assert.equal(options.headers['content-type'], 'application/json')
          assert.equal(options.body, '{"type":"test-type","data":"test-data"}')
        })
    })

    it('handles HTTP errors gracefully', () => {
      fetchStub.returns(resolve(ERROR_GENERIC, 500))
      const client = new Client('http://m', 'test-auth-token')
      client.post('test-type', 'test-data')
        .then(
          () => { throw new Error('Should have thrown') },
          (err) => {
            assert.equal(err.status, 500)
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
    headers: new Headers({
      'content-type': type,
    }),
  }))
}

function resolveJson(serialized: string, status = 200) {
  return resolve(serialized, status, 'application/json')
}

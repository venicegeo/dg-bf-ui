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
import axios from 'axios'
import * as service from '../../src/api/session'
import * as worker from '../../src/api/workers/session'

describe('Session Service', () => {
  let globalStubs: GlobalStubs

  beforeEach(() => {
    globalStubs = {
      error: sinon.stub(console, 'error'),
    }
  })

  afterEach(() => {
    service.destroy()
    globalStubs.error.restore()
  })

  describe('create()', () => {
    let stubPost: Sinon.SinonStub,
      stubCreate: Sinon.SinonStub

    beforeEach(() => {
      stubPost = sinon.stub(axios, 'post')
      stubCreate = sinon.stub(axios, 'create')
    })

    afterEach(() => {
      stubPost.restore()
      stubCreate.restore()
    })

    it('sends correct credentials', () => {
      stubPost.returns(Promise.resolve({data: {api_key: 'test-api-key-from-response'}}))
      return service.create('test-username', 'test-password')
        .then(() => {
          assert.deepEqual(stubPost.firstCall.args, ['/test-api-root/login', null, {
            auth: {
              username: 'test-username',
              password: 'test-password',
            },
          }])
        })
    })

    it('correctly instantiates client', () => {
      stubPost.returns(Promise.resolve({data: {api_key: 'test-api-key-from-response'}}))
      return service.create('test-username', 'test-password')
        .then(() => {
          assert.deepEqual(stubCreate.firstCall.args, [{
            baseURL: '/test-api-root',
            timeout: 18000,
            auth: {
              username: 'test-api-key-from-response',
              password: '',
            },
          }])
        })
    })

    it('serializes session token', () => {
      stubPost.returns(Promise.resolve({data: {api_key: 'test-api-key-from-response'}}))
      return service.create('test-username', 'test-password')
        .then(() => {
          assert.equal(sessionStorage.getItem('apiKey'), 'test-api-key-from-response')
        })
    })

    it('does not serialize session token on failure', () => {
      stubPost.returns(Promise.reject(new Error('test-error')))
      return service.create('test-username', 'test-password')
        .then(
          () => assert.fail('Should have thrown'),
          () => {
            assert.isNull(sessionStorage.getItem('apiKey'))
          },
        )
    })

    it('throws if authentication fails', () => {
      stubPost.returns(Promise.reject(new Error('test-error')))
      return service.create('test-username', 'test-password')
        .then(
          () => assert.fail('Should have thrown'),
          (err) => {
            assert.instanceOf(err, Error)
          },
        )
    })

    it('exposes client instance on success', () => {
      stubPost.returns(Promise.resolve({data: {api_key: 'test-api-key-from-response'}}))
      const client = {isTotallyAnAxiosInstance: true}
      stubCreate.returns(client)
      return service.create('test-username', 'test-password')
        .then(() => {
          assert.strictEqual(service.getClient(), client)
        })
    })

    it('does not exposes client on failure', () => {
      stubPost.returns(Promise.reject(new Error('test-error')))
      return service.create('test-username', 'test-password')
        .then(
          () => assert.fail('Should have thrown'),
          (err) => {
            assert.throws(() => {
              service.getClient()
            })
          },
        )
    })
  })

  describe('getClient()', () => {
    let stub: Sinon.SinonStub

    beforeEach(() => {
      stub = sinon.stub(axios, 'create')
    })

    afterEach(() => {
      sessionStorage.clear()
      stub.restore()
    })

    it('throws if no session exists', () => {
      sessionStorage.setItem('apiKey', '')
      assert.throws(() => {
        service.getClient()
      })
    })

    it('correctly instantiates client', () => {
      sessionStorage.setItem('apiKey', 'test-api-key')
      service.getClient()
      assert.equal(stub.callCount, 1)
      assert.deepEqual(stub.firstCall.args, [{
        baseURL: '/test-api-root',
        timeout: 18000,
        auth: {
          username: 'test-api-key',
          password: '',
        },
      }])
    })

    it('restores session if one exists', () => {
      const client = {isTotallyAnAxiosInstance: true}
      stub.returns(client)
      sessionStorage.setItem('apiKey', 'test-api-key')
      assert.strictEqual(service.getClient(), client)
    })

    it('can handle gratuitous invocations', () => {
      const client = {isTotallyAnAxiosInstance: true}
      stub.returns(client)
      sessionStorage.setItem('apiKey', 'test-api-key')
      assert.doesNotThrow(() => {
        for (let i = 0; i < 100; i++) {
          assert.strictEqual(service.getClient(), client)
        }
      })
    })
  })

  describe('exists()', () => {
    afterEach(() => {
      sessionStorage.clear()
    })

    it('indicates presence of a session', () => {
      sessionStorage.setItem('apiKey', 'test-api-key')
      assert.isTrue(service.exists())
    })

    it('indicates absence of a session', () => {
      sessionStorage.removeItem('apiKey')
      assert.isFalse(service.exists())
    })
  })

  describe('destroy()', () => {
    it('voids client instance', () => {
      sessionStorage.setItem('apiKey', 'test-api-key')
      service.destroy()
      assert.throws(() => {
        service.getClient()
      })
    })

    it('actually clears the session', () => {
      sessionStorage.setItem('apiKey', 'test-api-key')
      sessionStorage.setItem('lorem', '###########')
      sessionStorage.setItem('ipsum', '###########')
      sessionStorage.setItem('dolor', '###########')
      service.destroy()
      assert.equal(sessionStorage.length, 0)
    })
  })

  describe('startWorker()', () => {
    let client: Sinon.SinonStub

    beforeEach(() => {
      client = sinon.stub()
      sinon.stub(axios, 'create').returns(client)
      sessionStorage.setItem('apiKey', 'test-api-key')
    })

    afterEach(() => {
      sinon.restore(axios.create)
      sinon.restore(worker.start)
      sinon.restore(worker.terminate)
      sessionStorage.clear()
    })

    it('starts worker', () => {
      const stub = sinon.stub(worker, 'start')
      service.startWorker({ onExpired() {/* noop */} })
      assert.strictEqual(stub.firstCall.args[0].client, client)
      assert.isFunction(stub.firstCall.args[0].onExpired)
      assert.isNumber(stub.firstCall.args[0].interval)
    })

    it('throws if started without active session', () => {
      sessionStorage.removeItem('apiKey')
      sinon.stub(worker, 'start')
      assert.throws(() => {
        service.startWorker({ onExpired() {/* noop */} })
      })
    })
  })

  describe('stopWorker()', () => {
    beforeEach(() => {
      sessionStorage.setItem('apiKey', 'test-api-key')
    })

    afterEach(() => {
      sinon.restore(worker.start)
      sinon.restore(worker.terminate)
      sessionStorage.clear()
    })

    it('stops worker', () => {
      const stub = sinon.stub(worker, 'terminate')
      sinon.stub(worker, 'start')
      service.startWorker({ onExpired() {/* noop */} })
      service.stopWorker()
      assert.isTrue(stub.called)
    })
  })
})

//
// Helpers
//

interface GlobalStubs {
  error: Sinon.SinonStub
}

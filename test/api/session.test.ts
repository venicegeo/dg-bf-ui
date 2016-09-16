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

import {Client} from '../../src/utils/piazza-client'
import {assert} from 'chai'
import * as sinon from 'sinon'
import * as service from '../../src/api/session'
import * as worker from '../../src/api/workers/session'
import {GATEWAY} from '../../src/config'

describe('Session Service', () => {
  let globalStubs: GlobalStubs

  beforeEach(() => {
    globalStubs = {
      fetch: sinon.stub(window, 'fetch'),
      error: sinon.stub(console, 'error'),
    }
  })

  afterEach(() => {
    service.destroy()
    globalStubs.fetch.restore()
    globalStubs.error.restore()
  })

  describe('create()', () => {
    let stub: Sinon.SinonStub

    beforeEach(() => {
      stub = sinon.stub(Client, 'create')
    })

    afterEach(() => {
      stub.restore()
    })

    it('sends correct credentials', () => {
      stub.returns(Promise.resolve(generateClient()))
      return service.create('test-username', 'test-password')
        .then(() => {
          assert.deepEqual(stub.firstCall.args, [GATEWAY, 'test-username', 'test-password'])
        })
    })

    it('serializes session token', () => {
      stub.returns(Promise.resolve(generateClient()))
      return service.create('test-username', 'test-password')
        .then(() => {
          assert.equal(sessionStorage.getItem('token'), 'Basic dGVzdC1zb21lLXV1aWQ6')
        })
    })

    it('does not serialize session token on failure', () => {
      stub.returns(Promise.reject(new Error('test-error')))
      return service.create('test-username', 'test-password')
        .then(
          () => assert.fail('Should have thrown'),
          (err) => {
            assert.isNull(sessionStorage.getItem('token'))
          }
        )
    })

    it('throws if authentication fails', () => {
      stub.returns(Promise.reject(new Error('test-error')))
      return service.create('test-username', 'test-password')
        .then(
          () => assert.fail('Should have thrown'),
          (err) => {
            assert.instanceOf(err, Error)
          }
        )
    })

    it('exposes client instance on success', () => {
      const client = generateClient()
      stub.returns(Promise.resolve(client))
      return service.create('test-username', 'test-password')
        .then(() => {
          assert.strictEqual(service.getClient(), client)
        })
    })

    it('does not exposes client on failure', () => {
      stub.returns(Promise.reject(new Error('test-error')))
      return service.create('test-username', 'test-password')
        .then(
          () => assert.fail('Should have thrown'),
          (err) => {
            assert.throws(() => {
              service.getClient()
            })
          }
        )
    })
  })

  describe('getClient()', () => {
    afterEach(() => {
      sessionStorage.clear()
    })

    it('throws if no session exists', () => {
      sessionStorage.setItem('token', '')
      assert.throws(() => {
        service.getClient()
      })
    })

    it('restores session if one exists', () => {
      sessionStorage.setItem('token', 'Basic dGVzdC1zb21lLXV1aWQ6')
      assert.instanceOf(service.getClient(), Client)
    })
  })

  describe('exists()', () => {
    afterEach(() => {
      sessionStorage.clear()
    })

    it('indicates presence of a session', () => {
      sessionStorage.setItem('token', 'Basic dGVzdC1zb21lLXV1aWQ6')
      assert.isTrue(service.exists())
    })

    it('indicates absence of a session', () => {
      sessionStorage.removeItem('token')
      assert.isFalse(service.exists())
    })
  })

  describe('destroy()', () => {
    it('voids client instance', () => {
      sessionStorage.setItem('token', 'Basic dGVzdC1zb21lLXV1aWQ6')
      service.destroy()
      assert.throws(() => {
        service.getClient()
      })
    })

    it('actually clears the session', () => {
      sessionStorage.setItem('token', 'Basic dGVzdC1zb21lLXV1aWQ6')
      sessionStorage.setItem('lorem', '###########')
      sessionStorage.setItem('ipsum', '###########')
      sessionStorage.setItem('dolor', '###########')
      service.destroy()
      assert.equal(sessionStorage.length, 0)
    })
  })

  describe('startWorker()', () => {
    beforeEach(() => {
      sessionStorage.setItem('token', 'Basic dGVzdC1zb21lLXV1aWQ6')
    })

    afterEach(() => {
      sinon.restore(worker.start)
      sinon.restore(worker.terminate)
      sessionStorage.clear()
    })

    it('starts worker', () => {
      const stub = sinon.stub(worker, 'start')
      service.startWorker({
        onExpired() {/* noop */},
      })
      assert.instanceOf(stub.firstCall.args[0].client, Client)
      assert.isFunction(stub.firstCall.args[0].onExpired)
      assert.isNumber(stub.firstCall.args[0].interval)
    })

    it('throws if started without active session', () => {
      sessionStorage.removeItem('token')
      sinon.stub(worker, 'start')
      assert.throws(() => {
        service.startWorker({
          onExpired() {/* noop */},
        })
      })
    })
  })

  describe('stopWorker()', () => {
    beforeEach(() => {
      sessionStorage.setItem('token', 'Basic dGVzdC1zb21lLXV1aWQ6')
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
  fetch: Sinon.SinonStub
  error: Sinon.SinonStub
}

function generateClient() {
  return {
    sessionToken: 'Basic dGVzdC1zb21lLXV1aWQ6',
    gateway: GATEWAY,
  }
}

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
import * as worker from '../../../src/api/workers/session'

describe('Session Worker', function () {
  let client: Client
  let globalStubs: GlobalStubs

  this.timeout(100)

  beforeEach(() => {
    client = {
      isSessionActive: sinon.stub(),
    }

    globalStubs = {
      // Short circuit async operations
      setInterval:   sinon.stub(window, 'setInterval').returns(-1),
      clearInterval: sinon.stub(window, 'clearInterval').returns(-1),

      // Silence the console logging
      debug: sinon.stub(console, 'debug'),
      error: sinon.stub(console, 'error'),
    }
  })

  afterEach(() => {
    worker.terminate()
    globalStubs.setInterval.restore()
    globalStubs.clearInterval.restore()
    globalStubs.debug.restore()
    globalStubs.error.restore()
  })

  describe('start()', () => {
    it('can start worker instance', () => {
      client.isSessionActive.returns(Promise.resolve(true))
      assert.doesNotThrow(() => {
        worker.start({
          client,
          interval:  0,
          onExpired: sinon.stub(),
        })
      })
    })

    it('honors `interval` configuration', () => {
      const stub = globalStubs.setInterval
      worker.start({
        client,
        interval:  -1234,
        onExpired: sinon.stub(),
      })
      assert.equal(stub.firstCall.args[1], -1234)
    })

    it('does not being cycle immediately', () => {
      const stub = sinon.stub()
      worker.start({
        client,
        interval:  0,
        onExpired: stub,
      })
      assert.isFalse(stub.called)
    })

    it('throws if started twice', () => {
      worker.start({
        client:      (client as any),
        interval:    -1234,
        onExpired:   sinon.stub(),
      })
      assert.throws(() => {
        worker.start({
          client:      (client as any),
          interval:    -1234,
          onExpired:   sinon.stub(),
        })
      })
    })
  })

  describe('work cycle', () => {
    it('handles errors gracefully', () => {
      const stub = globalStubs.error
      client.isSessionActive.returns(Promise.reject(new Error('oh noes')))
      worker.start({
        client:      (client as any),
        interval:    0,
        onExpired:   sinon.stub(),
      })
      globalStubs.setInterval.callArg(0)  // Manually invoke tick
      return defer(() => {
        assert.equal(stub.firstCall.args[0], '(session:worker) failed:')
        assert.instanceOf(stub.firstCall.args[1], Error)
      })
    })
  })

  describe('event hook', () => {
    it('fires if session is expired', () => {
      const stub = sinon.stub()
      client.isSessionActive.returns(Promise.resolve(false))
      worker.start({
        client:      (client as any),
        interval:    0,
        onExpired:   stub,
      })
      globalStubs.setInterval.callArg(0)  // Manually invoke tick
      return defer(() => {
        assert.isTrue(stub.calledOnce)
      })
    })

    it('does not fire if session is active', () => {
      const stub = sinon.stub()
      client.isSessionActive.returns(Promise.resolve(true))
      worker.start({
        client:      (client as any),
        interval:    0,
        onExpired:   stub,
      })
      globalStubs.setInterval.callArg(0)  // Manually invoke tick
      return defer(() => {
        assert.isFalse(stub.calledOnce)
      })
    })
  })

  describe('terminate()', () => {
    it('stops worker', () => {
      globalStubs.setInterval.returns(-1234)
      const stub = globalStubs.clearInterval
      worker.start({
        client,
        interval:  0,
        onExpired: sinon.stub(),
      })
      worker.terminate()
      assert.equal(stub.callCount, 1)
      assert.isTrue(stub.calledWithExactly(-1234))
    })

    it('does not throw if called when worker is not started', () => {
      assert.doesNotThrow(() => {
        worker.terminate()
      })
    })

    it('can handle gratuitous invocations', () => {
      assert.doesNotThrow(() => {
        worker.terminate()
        worker.terminate()
        worker.terminate()
        worker.terminate()
        worker.terminate()
      })
    })
  })
})

//
// Types
//

interface Client {
  isSessionActive: Sinon.SinonStub
}

interface GlobalStubs {
  setInterval: Sinon.SinonStub
  clearInterval: Sinon.SinonStub
  debug: Sinon.SinonStub
  error: Sinon.SinonStub
}

//
// Helpers
//

function defer(func, delay = 1) {
  return new Promise(resolve => setTimeout(resolve, delay)).then(func)
}

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
import {generateAlgorithmDescriptor} from '../../fixtures/beachfront-service-descriptors'
import * as worker from 'app/actions/workers/algorithms'

describe('Algorithms Worker', () => {
  let client, handlers, globalStubs

  beforeEach(() => {
    client = generateClientSpy()
    handlers = generateHandlerSpies()

    globalStubs = {
      // Short circuit async operations by default
      setInterval:   sinon.stub(window, 'setInterval').returns(-1),
      clearInterval: sinon.stub(window, 'clearInterval'),

      // Silence the console logging
      consoleDebug:  sinon.stub(console, 'debug'),
      consoleError:  sinon.stub(console, 'error'),
    }
  })

  afterEach(() => {
    worker.terminate()
    sinon.restore(globalStubs.clearInterval)
    sinon.restore(globalStubs.setInterval)
    sinon.restore(globalStubs.consoleDebug)
    sinon.restore(globalStubs.consoleError)
  })

  describe('start()', () => {
    it('can start worker instance', () => {
      assert.doesNotThrow(() => {
        worker.start(client, 0, handlers)
      })
    })

    it('honors `interval` configuration', () => {
      worker.start(client, 1234, handlers)
      assert.equal(globalStubs.setInterval.firstCall.args[1], 1234)
    })

    it('throws if started twice', () => {
      worker.start(client, 0, handlers)
      assert.throws(() => {
        worker.start(client, 0, handlers)
      }, /already running/)
    })

    it('starts cycle immediately', () => {
      worker.start(client, 0, handlers)
      assert.isTrue(handlers.shouldRun.called)
    })
  })

  describe('work cycle', () => {
    beforeEach(() => {
      handlers.shouldRun.returns(true)
    })

    it('yields valid algorithm records', (done) => {
      client.getServices.returns(Promise.resolve([generateAlgorithmDescriptor()]))
      worker.start(client, 0, handlers)
      defer(() => {
        const [[algorithm]] = handlers.onUpdate.lastCall.args
        assert.equal(algorithm.id, 'test-service-id')
        assert.equal(algorithm.name, 'test-name')
        assert.equal(algorithm.description, 'test-description')
        assert.isArray(algorithm.requirements)
        assert.equal(algorithm.requirements.length, 3)
      }, done)
    })

    it('normalizes algorithm requirements', (done) => {
      client.getServices.returns(Promise.resolve([generateAlgorithmDescriptor()]))
      worker.start(client, 0, handlers)
      defer(() => {
        const [[algorithm]] = handlers.onUpdate.lastCall.args
        algorithm.requirements.forEach(r => {
          assert.isString(r.name)
          assert.isString(r.description)
          assert.isDefined(r.literal)
        })
      }, done)
    })

    it('halts on error', (done) => {
      const err = new Error('test-error')
      client.getServices.returns(Promise.reject(err))
      worker.start(client, 0, handlers)
      defer(() => {
        assert.equal(client.getServices.callCount, 1)
      }, done, 5)
    })

    it('emits errors via console', (done) => {
      const err = new Error('test-error')
      client.getServices.returns(Promise.reject(err))
      worker.start(client, 0, handlers)
      defer(() => {
        assert.deepEqual(globalStubs.consoleError.firstCall.args, ['(algorithms:worker) cycle failed; terminating.', err])
      }, done)
    })

    it('emits cycle info via console', (done) => {
      client.getServices.returns(Promise.resolve([]))
      worker.start(client, 0, handlers)
      defer(() => {
        assert.equal(globalStubs.consoleDebug.firstCall.args[0], '(algorithms:worker) updating')
      }, done)
    })

    it('skips if `shouldRun()` returns false', (done) => {
      handlers.shouldRun.returns(false)
      worker.start(client, 0, handlers)
      defer(() => {
        assert.equal(client.getServices.callCount, 0)
      }, done)
    })
  })

  describe('event hooks', () => {
    beforeEach(() => {
      handlers.shouldRun.returns(true)
    })

    it('fire on normal cycle', (done) => {
      client.getServices.returns(Promise.resolve([]))
      handlers.shouldRun.returns(true)
      worker.start(client, 0, handlers)
      defer(() => {
        assert.equal(handlers.shouldRun.callCount, 1)
        assert.equal(handlers.beforeFetch.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 0)
      }, done)
    })

    it('fire on skipped cycle', (done) => {
      handlers.shouldRun.returns(false)
      worker.start(client, 0, handlers)
      defer(() => {
        assert.equal(handlers.shouldRun.callCount, 1)
        assert.equal(handlers.beforeFetch.callCount, 0)
        assert.equal(handlers.onUpdate.callCount, 0)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 0)
      }, done)
    })

    it('fire on network failure', (done) => {
      client.getServices.returns(Promise.reject(new Error('test-error')))
      worker.start(client, 0, handlers)
      defer(() => {
        assert.equal(handlers.shouldRun.callCount, 1)
        assert.equal(handlers.beforeFetch.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 0)
        assert.equal(handlers.onFailure.callCount, 1)
        assert.equal(handlers.onTerminate.callCount, 1)
      }, done)
    })

    it('fire on translation failure', (done) => {
      client.getServices.returns(Promise.resolve(['not a service descriptor']))
      worker.start(client, 0, handlers)
      defer(() => {
        assert.equal(handlers.shouldRun.callCount, 1)
        assert.equal(handlers.beforeFetch.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 0)
        assert.equal(handlers.onFailure.callCount, 1)
        assert.equal(handlers.onTerminate.callCount, 1)
      }, done)
    })

    it('fire on termination', (done) => {
      handlers.shouldRun.returns(false)
      worker.start(client, 0, handlers)
      worker.terminate()
      defer(() => {
        assert.equal(handlers.shouldRun.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 0)
        assert.equal(handlers.beforeFetch.callCount, 0)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 1)
      }, done)
    })
  })

  describe('terminate()', function () {
    it('stops worker', () => {
      globalStubs.setInterval.returns(-1234)
      worker.start(client, 0, handlers)
      worker.terminate()
      assert.isTrue(globalStubs.clearInterval.calledWithExactly(-1234))
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
// Helpers
//

function generateClientSpy() {
  return {
    getServices: sinon.stub(),
  }
}

function generateHandlerSpies() {
  return {
    beforeFetch: sinon.stub(),
    onFailure:   sinon.stub(),
    onTerminate: sinon.stub(),
    onUpdate:    sinon.stub(),
    shouldRun:   sinon.stub().returns(false),
  }
}

function defer(func, done, duration = 0) {
  return new Promise(resolve => setTimeout(resolve, duration))
    .then(func)
    .then(done)
    .catch(done)
}

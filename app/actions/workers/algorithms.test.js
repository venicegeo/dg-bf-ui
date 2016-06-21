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

import expect, {spyOn, restoreSpies, createSpy} from 'expect'
import {generateAlgorithmDescriptor} from '../../../test/fixtures/beachfront-service-descriptors'
import * as worker from './algorithms'

describe('Algorithms Worker', () => {
  let client, handlers

  beforeEach(() => {
    client = generateClientSpy()
    handlers = generateHandlerSpies()

    // Short circuit async operations by default
    spyOn(window, 'setInterval').andReturn(-1)
    spyOn(window, 'clearInterval')

    // Silence the console logging
    spyOn(console, 'debug')
    spyOn(console, 'error')
  })

  afterEach(() => {
    worker.terminate()
    restoreSpies()
  })

  describe('start()', () => {
    it('can start worker instance', () => {
      expect(() => {
        worker.start(client, 0, handlers)
      }).toNotThrow()
    })

    it('honors `interval` configuration', () => {
      worker.start(client, 1234, handlers)
      expect(window.setInterval.calls[0].arguments[1]).toEqual(1234)
    })

    it('throws if started twice', () => {
      worker.start(client, 0, handlers)
      expect(() => {
        worker.start(client, 0, handlers)
      }).toThrow(/already running/)
    })

    it('starts cycle immediately', () => {
      worker.start(client, 0, handlers)
      expect(handlers.shouldRun).toHaveBeenCalled()
    })
  })

  describe('work cycle', () => {
    beforeEach(() => {
      handlers.shouldRun.andReturn(true)
    })

    it('yields valid algorithm records', (done) => {
      client.getServices.andReturn(Promise.resolve([generateAlgorithmDescriptor()]))
      worker.start(client, 0, handlers)
      defer(() => {
        const [[algorithm]] = handlers.onUpdate.getLastCall().arguments
        expect(algorithm.id).toEqual('test-service-id')
        expect(algorithm.name).toEqual('test-name')
        expect(algorithm.description).toEqual('test-description')
        expect(algorithm.requirements).toBeAn(Array)
        expect(algorithm.requirements.length).toEqual(3)
      }, done)
    })

    it('normalizes algorithm requirements', (done) => {
      client.getServices.andReturn(Promise.resolve([generateAlgorithmDescriptor()]))
      worker.start(client, 0, handlers)
      defer(() => {
        const [[algorithm]] = handlers.onUpdate.getLastCall().arguments
        algorithm.requirements.forEach(r => {
          expect(r.name).toBeA('string')
          expect(r.description).toBeA('string')
          expect(r.literal).toExist()
        })
      }, done)
    })

    it('halts on error', (done) => {
      const err = new Error('test-error')
      client.getServices.andReturn(Promise.reject(err))
      worker.start(client, 0, handlers)
      defer(() => {
        expect(client.getServices.calls.length).toEqual(1)
      }, done, 5)
    })

    it('emits errors via console', (done) => {
      const err = new Error('test-error')
      client.getServices.andReturn(Promise.reject(err))
      worker.start(client, 0, handlers)
      defer(() => {
        expect(console.error.calls[0].arguments).toEqual(['(algorithms:worker) cycle failed; terminating.', err])
      }, done)
    })

    it('emits cycle info via console', (done) => {
      client.getServices.andReturn(Promise.resolve([]))
      worker.start(client, 0, handlers)
      defer(() => {
        expect(console.debug.calls[0].arguments[0]).toEqual('(algorithms:worker) updating')
      }, done)
    })

    it('skips if `shouldRun()` returns false', (done) => {
      handlers.shouldRun.andReturn(false)
      worker.start(client, 0, handlers)
      defer(() => {
        expect(client.getServices).toNotHaveBeenCalled()
      }, done)
    })
  })

  describe('event hooks', () => {
    beforeEach(() => {
      handlers.shouldRun.andReturn(true)
    })

    it('fire on normal cycle', (done) => {
      client.getServices.andReturn(Promise.resolve([]))
      handlers.shouldRun.andReturn(true)
      worker.start(client, 0, handlers)
      defer(() => {
        expect(handlers.shouldRun).toHaveBeenCalled()
        expect(handlers.beforeFetch).toHaveBeenCalled()
        expect(handlers.onUpdate).toHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toNotHaveBeenCalled()
      }, done)
    })

    it('fire on skipped cycle', (done) => {
      handlers.shouldRun.andReturn(false)
      worker.start(client, 0, handlers)
      defer(() => {
        expect(handlers.shouldRun).toHaveBeenCalled()
        expect(handlers.beforeFetch).toNotHaveBeenCalled()
        expect(handlers.onUpdate).toNotHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toNotHaveBeenCalled()
      }, done)
    })

    it('fire on network failure', (done) => {
      client.getServices.andReturn(Promise.reject(new Error('test-error')))
      worker.start(client, 0, handlers)
      defer(() => {
        expect(handlers.shouldRun).toHaveBeenCalled()
        expect(handlers.beforeFetch).toHaveBeenCalled()
        expect(handlers.onUpdate).toNotHaveBeenCalled()
        expect(handlers.onFailure).toHaveBeenCalled()
        expect(handlers.onTerminate).toHaveBeenCalled()
      }, done)
    })

    it('fire on translation failure', (done) => {
      client.getServices.andReturn(Promise.resolve(['not a service descriptor']))
      worker.start(client, 0, handlers)
      defer(() => {
        expect(handlers.shouldRun).toHaveBeenCalled()
        expect(handlers.beforeFetch).toHaveBeenCalled()
        expect(handlers.onUpdate).toNotHaveBeenCalled()
        expect(handlers.onFailure).toHaveBeenCalled()
        expect(handlers.onTerminate).toHaveBeenCalled()
      }, done)
    })

    it('fire on termination', (done) => {
      handlers.shouldRun.andReturn(false)
      worker.start(client, 0, handlers)
      worker.terminate()
      defer(() => {
        expect(handlers.shouldRun).toHaveBeenCalled()
        expect(handlers.onUpdate).toNotHaveBeenCalled()
        expect(handlers.beforeFetch).toNotHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toHaveBeenCalled()
      }, done)
    })
  })

  describe('terminate()', function () {
    it('stops worker', () => {
      window.setInterval.andReturn(-1234)
      worker.start(client, 0, handlers)
      worker.terminate()
      expect(window.clearInterval).toHaveBeenCalledWith(-1234)
    })

    it('does not throw if called when worker is not started', () => {
      expect(() => {
        worker.terminate()
      }).toNotThrow()
    })

    it('can handle gratuitous invocations', () => {
      expect(() => {
        worker.terminate()
        worker.terminate()
        worker.terminate()
        worker.terminate()
        worker.terminate()
      }).toNotThrow()
    })
  })
})

//
// Helpers
//

function generateClientSpy() {
  return {
    getServices: createSpy()
  }
}

function generateHandlerSpies() {
  return {
    beforeFetch: createSpy(),
    onFailure:   createSpy(),
    onTerminate: createSpy(),
    onUpdate:    createSpy(),
    shouldRun:   createSpy().andReturn(false)
  }
}

function defer(func, done, duration = 0) {
  return new Promise(resolve => setTimeout(resolve, duration))
    .then(func)
    .then(done)
    .catch(done)
}

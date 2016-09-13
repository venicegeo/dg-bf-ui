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
import * as worker from '../../../src/api/workers/jobs'
import {
  SCHEMA_VERSION,
} from '../../../src/config'
import {
  RESPONSE_JOB_ERROR,
  RESPONSE_JOB_RUNNING,
  RESPONSE_JOB_SUCCESS,
} from '../../fixtures/piazza-responses'
import {
  TYPE_JOB,
  STATUS_ERROR,
  STATUS_RUNNING,
  STATUS_SUCCESS,
  STATUS_TIMED_OUT,
} from '../../../src/constants'

interface Client {
  getDeployment: Sinon.SinonStub
  getFile: Sinon.SinonStub
  getStatus: Sinon.SinonStub
}

interface Handlers {
  getRunningJobs: Sinon.SinonStub
  onError: Sinon.SinonStub
  onTerminate: Sinon.SinonStub
  onUpdate: Sinon.SinonStub
}

interface GlobalStubs {
  setInterval: Sinon.SinonStub
  clearInterval: Sinon.SinonStub
  debug: Sinon.SinonStub
  error: Sinon.SinonStub
  warn: Sinon.SinonStub
}

describe('Jobs Worker', () => {
  let client: Client, handlers: Handlers, globalStubs: GlobalStubs

  beforeEach(() => {
    client = {
      getDeployment: sinon.stub(),
      getFile:       sinon.stub(),
      getStatus:     sinon.stub(),
    }

    handlers = {
      getRunningJobs: sinon.stub().returns([]),
      onError:        sinon.stub(),
      onTerminate:    sinon.stub(),
      onUpdate:       sinon.stub(),
    }

    globalStubs = {
      // Short circuit async operations
      setInterval: sinon.stub(window, 'setInterval').returns(-1),
      clearInterval: sinon.stub(window, 'clearInterval'),

      // Silence the console logging
      debug: sinon.stub(console, 'debug'),
      error: sinon.stub(console, 'error'),
      warn: sinon.stub(console, 'warn'),
    }
  })

  afterEach(() => {
    worker.terminate()
    globalStubs.setInterval.restore()
    globalStubs.clearInterval.restore()
    globalStubs.debug.restore()
    globalStubs.error.restore()
    globalStubs.warn.restore()
  })

  describe('start()', () => {
    it('can start worker instance', () => {
      assert.doesNotThrow(() => {
        worker.start({
          client,
          interval:       0,
          ttl:            1000,
          getRunningJobs: handlers.getRunningJobs,
          onError:        handlers.onError,
          onTerminate:    handlers.onTerminate,
          onUpdate:       handlers.onUpdate,
        })
      })
    })

    it('honors `interval` configuration', () => {
      worker.start({
        client,
        interval:       1234,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs,
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      assert.equal(globalStubs.setInterval.firstCall.args[1], 1234)
    })

    it('throws if started twice', () => {
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs,
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      assert.throws(() => {
        worker.start({
          client,
          interval:       0,
          ttl:            1000,
          getRunningJobs: handlers.getRunningJobs,
          onError:        handlers.onError,
          onTerminate:    handlers.onTerminate,
          onUpdate:       handlers.onUpdate,
        })
      }, /already running/)
    })

    it('starts cycle immediately', () => {
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs,
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      assert.isTrue(handlers.getRunningJobs.called)
    })
  })

  describe('work cycle', () => {
    it('yields appropriate status for running jobs', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_RUNNING, null, null, null])
      }, done)
    })

    it('yields appropriate status for stalled jobs', (done) => {
      const job = generateJob('test-stalled', STATUS_RUNNING)
      job.properties.createdOn -= 2000
      client.getStatus.returns(Promise.resolve(generateStatusRunning('test-stalled')))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([job]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-stalled', STATUS_TIMED_OUT, null, null, null])
      }, done)
    })

    it('yields appropriate status for failed jobs', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusError()))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_ERROR, null, null, null])
      }, done)
    })

    it('yields appropriate status for successful jobs', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusSuccess()))
      client.getFile.returns(Promise.resolve('{"shoreDataID":"test-vector-data-id","shoreDeplID":"test-deployment-id","rgbLoc":"","error":""}'))
      client.getDeployment.returns(Promise.resolve(generateDeploymentDescriptor()))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_SUCCESS, 'test-vector-data-id', 'test-layer-id', 'test-endpoint'])
      }, done)
    })

    it('yields appropriate status for ambiguous execution metadata', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusSuccess()))
      client.getFile.returns(Promise.resolve('clearly invalid execution metadata'))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_ERROR, null, null, null])
      }, done)
    })

    it('does not trainwreck on server error (getStatus)', (done) => {
      client.getStatus
        .withArgs('test-everything-is-okay').returns(Promise.resolve(generateStatusRunning('test-everything-is-okay')))
        .withArgs('test-will-explode').returns(Promise.reject(new Error('test-error')))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([
          generateJob('test-will-explode'),
          generateJob('test-everything-is-okay'),
        ]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-will-explode', STATUS_ERROR, null, null, null])
        assert.deepEqual(handlers.onUpdate.secondCall.args, ['test-everything-is-okay', STATUS_RUNNING, null, null, null])
      }, done)
    })

    it('does not trainwreck on server error (getFile)', (done) => {
      client.getStatus
        .withArgs('test-everything-is-okay').returns(Promise.resolve(generateStatusRunning('test-everything-is-okay')))
        .withArgs('test-will-explode').returns(Promise.resolve(generateStatusSuccess('test-will-explode')))
      client.getFile
        .withArgs('test-will-explode').returns(Promise.reject(new Error('test-error')))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([
          generateJob('test-will-explode'),
          generateJob('test-everything-is-okay'),
        ]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-will-explode', STATUS_ERROR, null, null, null])
        assert.deepEqual(handlers.onUpdate.secondCall.args, ['test-everything-is-okay', STATUS_RUNNING, null, null, null])
      }, done)
    })

    it('halts on javascript error', (done) => {
      client.getStatus
        .onFirstCall().returns(Promise.resolve(generateStatusRunning('test-id-1')))
        .onSecondCall().returns(Promise.resolve(generateStatusRunning('test-id-2')))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([
          generateJob('test-id-1'),
          generateJob('test-id-2'),
        ]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate.throws(new Error('test-error')),
      })
      defer(() => {
        assert.equal(handlers.onUpdate.callCount, 1)
      }, done)
    })

    it('emits cycle info via console', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.isTrue(globalStubs.debug.calledWith('(jobs:worker) cycle started'))
      }, done)
    })

    it('emits errors via console', (done) => {
      const err = new Error('test-error')
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate.throws(err),
      })
      defer(() => {
        assert.isTrue(globalStubs.error.calledWithExactly('(jobs:worker) cycle failed; terminating.', err))
      }, done)
    })

    it('emits timeout warnings via console', (done) => {
      const job = generateJob('test-stalled', STATUS_RUNNING)
      job.properties.createdOn -= 2000
      client.getStatus.returns(Promise.resolve(generateStatusRunning('test-stalled')))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([job]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.isTrue(globalStubs.warn.calledWithExactly('(jobs:worker) <%s> appears to have stalled and will no longer be tracked', 'test-stalled'))
      }, done)
    })

    it('skips cycle if no running jobs', (done) => {
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs,
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.isFalse(handlers.onUpdate.called)
      }, done)
    })
  })

  describe('event hooks', () => {
    it('fire on normal cycle', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.isTrue(handlers.getRunningJobs.called)
        assert.isTrue(handlers.onUpdate.called)
        assert.isFalse(handlers.onError.called)
        assert.isFalse(handlers.onTerminate.called)
      }, done)
    })

    it('fire on skipped cycle (records empty)', (done) => {
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs,
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.isTrue(handlers.getRunningJobs.called)
        assert.isFalse(handlers.onError.called)
        assert.isFalse(handlers.onTerminate.called)
        assert.isFalse(handlers.onUpdate.called)
      }, done)
    })

    it('fire on service call failure', (done) => {
      client.getStatus.returns(Promise.reject(new Error('test-error')))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.isTrue(handlers.getRunningJobs.called)
        assert.isTrue(handlers.onUpdate.called)
        assert.isFalse(handlers.onError.called)
        assert.isFalse(handlers.onTerminate.called)
      }, done)
    })

    it('fire on javascript error', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate.throws(new Error('test-error')),
      })
      defer(() => {
        assert.isTrue(handlers.getRunningJobs.called)
        assert.isTrue(handlers.onUpdate.called)
        assert.isTrue(handlers.onError.called)
        assert.isTrue(handlers.onTerminate.called)
      }, done)
    })

    it('fire on resolution failure', (done) => {
      client.getStatus.returns(Promise.resolve(generateStatusSuccess()))
      client.getFile.returns(Promise.resolve('clearly invalid execution metadata'))
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs.returns([generateJob()]),
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      defer(() => {
        assert.isTrue(handlers.getRunningJobs.called)
        assert.isTrue(handlers.onUpdate.called)
        assert.isFalse(handlers.onError.called)
        assert.isFalse(handlers.onTerminate.called)
      }, done)
    })

    it('fire on termination', (done) => {
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs,
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
      worker.terminate()
      defer(() => {
        assert.isTrue(handlers.getRunningJobs.called)
        assert.isTrue(handlers.onTerminate.called)
        assert.isFalse(handlers.onError.called)
        assert.isFalse(handlers.onUpdate.called)
      }, done)
    })
  })

  describe('terminate()', function () {
    it('stops worker', () => {
      globalStubs.setInterval.returns(-1234)
      worker.start({
        client,
        interval:       0,
        ttl:            1000,
        getRunningJobs: handlers.getRunningJobs,
        onError:        handlers.onError,
        onTerminate:    handlers.onTerminate,
        onUpdate:       handlers.onUpdate,
      })
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

function generateDeploymentDescriptor() {
  return {
    dataId:   'test-raster-data-id',
    layerId:  'test-layer-id',
    endpoint: 'test-endpoint',
  }
}

function generateJob(id = 'test-id', status = STATUS_RUNNING) {
  return {
    id,
    properties: {
      __schemaVersion__: SCHEMA_VERSION,
      algorithmName:     'test-algo-name',
      sceneId:           'test-scene-id',
      createdOn:         Date.now(),
      name:              'test-name',
      status:            status,
      type:              TYPE_JOB,
    },
    geometry: {},
    type: 'Feature',
  }
}

function generateStatusError(jobId = 'test-id') {
  return Object.assign(JSON.parse(RESPONSE_JOB_ERROR).data, { jobId })
}

function generateStatusRunning(jobId = 'test-id') {
  return Object.assign(JSON.parse(RESPONSE_JOB_RUNNING).data, { jobId })
}

function generateStatusSuccess(jobId = 'test-id') {
  return Object.assign(JSON.parse(RESPONSE_JOB_SUCCESS).data, { jobId })
}

function defer(func, done, duration = 0) {
  return new Promise(resolve => setTimeout(resolve, duration))
    .then(func)
    .then(done)
    .catch(done)
}

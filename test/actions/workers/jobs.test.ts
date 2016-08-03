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
import * as worker from 'app/actions/workers/jobs'
import {
  SCHEMA_VERSION,
} from 'app/config'
import {
  RESPONSE_JOB_ERROR,
  RESPONSE_JOB_RUNNING,
  RESPONSE_JOB_SUCCESS,
} from '../../fixtures/piazza-responses'
import {
  KEY_IMAGE_ID,
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_NAME,
  KEY_STATUS,
  KEY_TYPE,
  KEY_SCHEMA_VERSION,
  KEY_THUMBNAIL,
  TYPE_JOB,
  STATUS_ERROR,
  STATUS_RUNNING,
  STATUS_SUCCESS,
  STATUS_TIMED_OUT,
} from 'app/constants'

describe('Jobs Worker', () => {
  let client,
      handlers,
      globalStubs

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
      consoleWarn:   sinon.stub(console, 'warn'),
    }
  })

  afterEach(() => {
    worker.terminate()
    sinon.restore(globalStubs.clearInterval)
    sinon.restore(globalStubs.setInterval)
    sinon.restore(globalStubs.consoleDebug)
    sinon.restore(globalStubs.consoleError)
    sinon.restore(globalStubs.consoleWarn)
  })

  describe('start()', () => {
    it('can start worker instance', () => {
      assert.doesNotThrow(() => {
        worker.start(client, 0, 1000, handlers)
      })
    })

    it('honors `interval` configuration', () => {
      worker.start(client, 1234, 1000, handlers)
      assert.isTrue(globalStubs.setInterval.calledWithMatch(sinon.match.func, 1234))
    })

    it('throws if started twice', () => {
      worker.start(client, 0, 1000, handlers)
      assert.throws(() => {
        worker.start(client, 0, 1000, handlers)
      }, /already running/)
    })

    it('starts cycle immediately', () => {
      worker.start(client, 0, 1000, handlers)
      assert.isTrue(handlers.getRecords.calledOnce)
    })
  })

  describe('work cycle', () => {
    it('yields appropriate status for running jobs', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_RUNNING, null, null, null, null])
      }, done)
    })

    it('yields appropriate status for stalled jobs', (done) => {
      const job = generateJob('test-stalled', STATUS_RUNNING)
      job.properties[KEY_CREATED_ON] -= 1000

      handlers.getRecords.returns([job])
      client.getStatus.returns(Promise.resolve(generateStatusRunning('test-stalled')))
      worker.start(client, 0, 0, handlers)
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-stalled', STATUS_TIMED_OUT, null, null, null, null])
      }, done)
    })

    it('yields appropriate status for failed jobs', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusError()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_ERROR, null, null, null, null])
      }, done)
    })

    it('yields appropriate status for successful jobs', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusSuccess()))
      client.getFile.returns(Promise.resolve('{"shoreDataID":"test-vector-data-id","shoreDeplID":"test-deployment-id","rgbLoc":"","error":""}'))
      client.getDeployment.returns(Promise.resolve(generateDeploymentDescriptor()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_SUCCESS, 'test-vector-data-id', 'test-raster-data-id', 'test-layer-id', 'test-endpoint'])
      }, done)
    })

    it('yields appropriate status for ambiguous execution metadata', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusSuccess()))
      client.getFile.returns(Promise.resolve('clearly invalid execution metadata'))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-id', STATUS_ERROR, null, null, null, null])
      }, done)
    })

    it('does not trainwreck on server error (getStatus)', (done) => {
      handlers.getRecords.returns([
        generateJob('explode'),
        generateJob('okidoki'),
      ])
      client.getStatus.withArgs('explode').returns(Promise.reject(new Error('test-error')))
      client.getStatus.withArgs('okidoki').returns(Promise.resolve(generateStatusRunning('okidoki')))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.isTrue(handlers.onUpdate.calledWithExactly('explode', STATUS_ERROR, null, null, null, null))
        assert.isTrue(handlers.onUpdate.calledWithExactly('okidoki', STATUS_RUNNING, null, null, null, null))
      }, done)
    })

    it('does not trainwreck on server error (getFile)', (done) => {
      handlers.getRecords.returns([
        generateJob('explode'),
        generateJob('okidoki'),
      ])
      client.getStatus.withArgs('explode').returns(Promise.resolve(generateStatusSuccess('explode')))
      client.getStatus.withArgs('okidoki').returns(Promise.resolve(generateStatusRunning('okidoki')))
      client.getFile.withArgs('explode').returns(Promise.reject(new Error('test-error')))
      client.getFile.withArgs('okidoki').returns(Promise.resolve('{"shoreDataID":"0123456789abcdef"}'))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.isTrue(handlers.onUpdate.calledWithExactly('explode', STATUS_ERROR, null, null, null, null))
        assert.isTrue(handlers.onUpdate.calledWithExactly('okidoki', STATUS_RUNNING, null, null, null, null))
      }, done)
    })

    it('halts on javascript error', (done) => {
      handlers.getRecords.returns([generateJob('test-id-1'), generateJob('test-id-2')])
      handlers.onUpdate.throws(new Error('test-error'))
      client.getStatus.withArgs('test-id-1').returns(Promise.resolve(generateStatusRunning('test-id-1')))
      client.getStatus.withArgs('test-id-2').returns(Promise.resolve(generateStatusRunning('test-id-2')))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.onUpdate.callCount, 1)
      }, done)
    })

    it('emits cycle info via console', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.isTrue(globalStubs.consoleDebug.calledWithExactly('(jobs:worker) cycle started'))
      }, done)
    })

    it('emits errors via console', (done) => {
      const err = new Error('test-error')
      handlers.getRecords.returns([generateJob()])
      handlers.onUpdate.throws(err)
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.isTrue(globalStubs.consoleError.calledWithExactly('(jobs:worker) cycle failed; terminating.', err))
      }, done)
    })

    it('emits timeout warnings via console', (done) => {
      const job = generateJob('test-stalled', STATUS_RUNNING)
      job.properties[KEY_CREATED_ON] -= 1000

      handlers.getRecords.returns([job])
      client.getStatus.returns(Promise.resolve(generateStatusRunning('test-stalled')))
      worker.start(client, 0, 0, handlers)
      defer(() => {
        assert.isTrue(globalStubs.consoleWarn.calledWithExactly('(jobs:worker) <%s> appears to have stalled and will no longer be tracked', 'test-stalled'))
      }, done)
    })

    it('only processes running jobs', (done) => {
      handlers.getRecords.returns([
        generateJob('test-failed', STATUS_ERROR),
        generateJob('test-still-running', STATUS_RUNNING),
        generateJob('test-succeeded', STATUS_SUCCESS),
        generateJob('test-stalled', STATUS_TIMED_OUT),
      ])
      client.getStatus.returns(Promise.resolve(generateStatusRunning('test-still-running')))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.onUpdate.callCount, 1)
        assert.deepEqual(handlers.onUpdate.firstCall.args, ['test-still-running', STATUS_RUNNING, null, null, null, null])
      }, done)
    })

    it('skips cycle if no running jobs', (done) => {
      handlers.getRecords.returns([
        generateJob('test-failed', STATUS_ERROR),
        generateJob('test-succeeded', STATUS_SUCCESS),
        generateJob('test-stalled', STATUS_TIMED_OUT),
      ])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.onUpdate.callCount, 0)
      }, done)
    })

    it('skips cycle if no running jobs (records empty)', (done) => {
      handlers.getRecords.returns([])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.onUpdate.callCount, 0)
      }, done)
    })
  })

  describe('event hooks', () => {
    it('fire on normal cycle', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.getRecords.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 0)
      }, done)
    })

    it('fire on skipped cycle', (done) => {
      handlers.getRecords.returns([
        generateJob('test-failed', STATUS_ERROR),
        generateJob('test-succeeded', STATUS_SUCCESS),
        generateJob('test-stalled', STATUS_TIMED_OUT),
      ])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.getRecords.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 0)
        assert.equal(handlers.onUpdate.callCount, 0)
      }, done)
    })

    it('fire on skipped cycle (records empty)', (done) => {
      handlers.getRecords.returns([])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.getRecords.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 0)
        assert.equal(handlers.onUpdate.callCount, 0)
      }, done)
    })

    it('fire on service call failure', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.reject(new Error('test-error')))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.getRecords.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 0)
      }, done)
    })

    it('fire on javascript error', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusRunning()))
      handlers.onUpdate.throws(new Error('test-error'))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.getRecords.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 1)
        assert.equal(handlers.onTerminate.callCount, 1)
      }, done)
    })

    it('fire on resolution failure', (done) => {
      handlers.getRecords.returns([generateJob()])
      client.getStatus.returns(Promise.resolve(generateStatusSuccess()))
      client.getFile.returns(Promise.resolve('clearly invalid execution metadata'))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        assert.equal(handlers.getRecords.callCount, 1)
        assert.equal(handlers.onUpdate.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onTerminate.callCount, 0)
      }, done)
    })

    it('fire on termination', (done) => {
      handlers.getRecords.returns([])
      worker.start(client, 0, 1000, handlers)
      worker.terminate()
      defer(() => {
        assert.equal(handlers.getRecords.callCount, 1)
        assert.equal(handlers.onTerminate.callCount, 1)
        assert.equal(handlers.onFailure.callCount, 0)
        assert.equal(handlers.onUpdate.callCount, 0)
      }, done)
    })
  })

  describe('terminate()', function () {
    it('stops worker', () => {
      globalStubs.setInterval.returns(-1234)
      worker.start(client, 0, 1000, handlers)
      worker.terminate()
      assert(globalStubs.clearInterval.calledWithExactly(-1234))
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
    getDeployment: sinon.stub(),
    getFile: sinon.stub(),
    getStatus: sinon.stub(),
  }
}

function generateDeploymentDescriptor() {
  return {
    dataId:   'test-raster-data-id',
    layerId:  'test-layer-id',
    endpoint: 'test-endpoint',
  }
}

function generateHandlerSpies() {
  return {
    getRecords:  sinon.stub().returns([]),
    onFailure:   sinon.stub(),
    onTerminate: sinon.stub(),
    onUpdate:    sinon.stub(),
  }
}

function generateJob(id = 'test-id', status = STATUS_RUNNING) {
  return {
    id,
    properties: {
      [KEY_ALGORITHM_NAME]: 'test-algo-name',
      [KEY_IMAGE_ID]:       'test-image-id',
      [KEY_CREATED_ON]:     Date.now(),
      [KEY_NAME]:           'test-name',
      [KEY_STATUS]:         status,
      [KEY_TYPE]:           TYPE_JOB,
      [KEY_SCHEMA_VERSION]: SCHEMA_VERSION,
      [KEY_THUMBNAIL]:      'test-thumbnail',
    },
    geometry: {},
    type: 'Feature',
  }
}

function generateStatusError(jobId = 'test-id') {
  return Object.assign(JSON.parse(RESPONSE_JOB_ERROR).data, {
    jobId,
  })
}

function generateStatusRunning(jobId = 'test-id') {
  return Object.assign(JSON.parse(RESPONSE_JOB_RUNNING).data, {
    jobId,
  })
}

function generateStatusSuccess(jobId = 'test-id') {
  return Object.assign(JSON.parse(RESPONSE_JOB_SUCCESS).data, {
    jobId,
  })
}

function defer(func, done, duration = 0) {
  return new Promise(resolve => setTimeout(resolve, duration))
    .then(func)
    .then(done)
    .catch(done)
}

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
import * as worker from './jobs'
import {
  SCHEMA_VERSION
} from '../../config'
import {
  RESPONSE_JOB_ERROR,
  RESPONSE_JOB_RUNNING,
  RESPONSE_JOB_SUCCESS,
} from '../../../test/fixtures/piazza-responses'
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
} from '../../constants'

describe('Jobs Worker', () => {
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
    spyOn(console, 'warn')
  })

  afterEach(() => {
    worker.terminate()
    restoreSpies()
  })

  describe('start()', () => {
    it('can start worker instance', () => {
      expect(() => {
        worker.start(client, 0, 1000, handlers)
      }).toNotThrow()
    })

    it('honors `interval` configuration', () => {
      worker.start(client, 1234, 1000, handlers)
      expect(window.setInterval.calls[0].arguments[1]).toEqual(1234)
    })

    it('throws if started twice', () => {
      worker.start(client, 0, 1000, handlers)
      expect(() => {
        worker.start(client, 0, 1000, handlers)
      }).toThrow(/already running/)
    })

    it('starts cycle immediately', () => {
      worker.start(client, 0, 1000, handlers)
      expect(handlers.getRecords).toHaveBeenCalled()
    })
  })

  describe('work cycle', () => {
    it('yields appropriate status for running jobs', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-id', STATUS_RUNNING, null, null, null, null])
      }, done)
    })

    it('yields appropriate status for stalled jobs', (done) => {
      const job = generateJob('test-stalled', STATUS_RUNNING)
      job.properties[KEY_CREATED_ON] -= 1000

      handlers.getRecords.andReturn([job])
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning('test-stalled')))
      worker.start(client, 0, 0, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-stalled', STATUS_TIMED_OUT, null, null, null, null])
      }, done)
    })

    it('yields appropriate status for failed jobs', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusError()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-id', STATUS_ERROR, null, null, null, null])
      }, done)
    })

    it('yields appropriate status for successful jobs', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusSuccess()))
      client.getFile.andReturn(Promise.resolve('{"shoreDataID":"test-vector-data-id","rgbLoc":"test-deployment-id","error":""}'))
      client.getDeployment.andReturn(Promise.resolve(generateDeploymentDescriptor()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-id', STATUS_SUCCESS, 'test-vector-data-id', 'test-raster-data-id', 'test-layer-id', 'test-endpoint'])
      }, done)
    })

    it('yields appropriate status for ambiguous execution metadata', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusSuccess()))
      client.getFile.andReturn(Promise.resolve('clearly invalid execution metadata'))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-id', STATUS_ERROR, null, null, null, null])
      }, done)
    })

    it('does not trainwreck on server error (getStatus)', (done) => {
      handlers.getRecords.andReturn([
        generateJob('test-will-explode'),
        generateJob('test-everything-is-okay')
      ])
      client.getStatus.andCall(jobId => (jobId === 'test-will-explode') ?
        Promise.reject(new Error('test-error')) :
        Promise.resolve(generateStatusRunning(jobId))
      )
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-will-explode', STATUS_ERROR, null, null, null, null])
        expect(handlers.onUpdate.calls[1].arguments).toEqual(['test-everything-is-okay', STATUS_RUNNING, null, null, null, null])
      }, done)
    })

    it('does not trainwreck on server error (getFile)', (done) => {
      handlers.getRecords.andReturn([
        generateJob('test-will-explode'),
        generateJob('test-everything-is-okay')
      ])
      client.getStatus.andCall(jobId => (jobId === 'test-will-explode') ?
        Promise.resolve(generateStatusSuccess(jobId)) :
        Promise.resolve(generateStatusRunning(jobId))
      )
      client.getFile.andReturn(jobId => (jobId === 'test-will-explode') ?
        Promise.reject(new Error('test-error')) :
        Promise.resolve('{"shoreDataID":"0123456789abcdef"}')
      )
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-will-explode', STATUS_ERROR, null, null, null, null])
        expect(handlers.onUpdate.calls[1].arguments).toEqual(['test-everything-is-okay', STATUS_RUNNING, null, null, null, null])
      }, done)
    })

    it('halts on javascript error', (done) => {
      handlers.getRecords.andReturn([generateJob('test-id-1'), generateJob('test-id-2')])
      handlers.onUpdate.andThrow(new Error('test-error'))
      client.getStatus.andCall(jobId => Promise.resolve(generateStatusRunning(jobId)))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls.length).toEqual(1)
      }, done)
    })

    it('emits cycle info via console', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(console.debug).toHaveBeenCalledWith('(jobs:worker) cycle started')
      }, done)
    })

    it('emits errors via console', (done) => {
      const err = new Error('test-error')
      handlers.getRecords.andReturn([generateJob()])
      handlers.onUpdate.andThrow(err)
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(console.error).toHaveBeenCalledWith('(jobs:worker) cycle failed; terminating.', err)
      }, done)
    })

    it('emits timeout warnings via console', (done) => {
      const job = generateJob('test-stalled', STATUS_RUNNING)
      job.properties[KEY_CREATED_ON] -= 1000

      handlers.getRecords.andReturn([job])
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning('test-stalled')))
      worker.start(client, 0, 0, handlers)
      defer(() => {
        expect(console.warn).toHaveBeenCalledWith('(jobs:worker) <%s> appears to have stalled and will no longer be tracked', 'test-stalled')
      }, done)
    })

    it('only processes running jobs', (done) => {
      handlers.getRecords.andReturn([
        generateJob('test-failed', STATUS_ERROR),
        generateJob('test-still-running', STATUS_RUNNING),
        generateJob('test-succeeded', STATUS_SUCCESS),
        generateJob('test-stalled', STATUS_TIMED_OUT),
      ])
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning('test-still-running')))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate.calls.length).toEqual(1)
        expect(handlers.onUpdate.calls[0].arguments).toEqual(['test-still-running', STATUS_RUNNING, null, null, null, null])
      }, done)
    })

    it('skips cycle if no running jobs', (done) => {
      handlers.getRecords.andReturn([
        generateJob('test-failed', STATUS_ERROR),
        generateJob('test-succeeded', STATUS_SUCCESS),
        generateJob('test-stalled', STATUS_TIMED_OUT),
      ])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate).toNotHaveBeenCalled()
      }, done)
    })

    it('skips cycle if no running jobs (records empty)', (done) => {
      handlers.getRecords.andReturn([])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.onUpdate).toNotHaveBeenCalled()
      }, done)
    })
  })

  describe('event hooks', () => {
    it('fire on normal cycle', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning()))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.getRecords).toHaveBeenCalled()
        expect(handlers.onUpdate).toHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toNotHaveBeenCalled()
      }, done)
    })

    it('fire on skipped cycle', (done) => {
      handlers.getRecords.andReturn([
        generateJob('test-failed', STATUS_ERROR),
        generateJob('test-succeeded', STATUS_SUCCESS),
        generateJob('test-stalled', STATUS_TIMED_OUT),
      ])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.getRecords).toHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toNotHaveBeenCalled()
        expect(handlers.onUpdate).toNotHaveBeenCalled()
      }, done)
    })

    it('fire on skipped cycle (records empty)', (done) => {
      handlers.getRecords.andReturn([])
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.getRecords).toHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toNotHaveBeenCalled()
        expect(handlers.onUpdate).toNotHaveBeenCalled()
      }, done)
    })

    it('fire on service call failure', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.reject(new Error('test-error')))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.getRecords).toHaveBeenCalled()
        expect(handlers.onUpdate).toHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toNotHaveBeenCalled()
      }, done)
    })

    it('fire on javascript error', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusRunning()))
      handlers.onUpdate.andThrow(new Error('test-error'))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.getRecords).toHaveBeenCalled()
        expect(handlers.onUpdate).toHaveBeenCalled()
        expect(handlers.onFailure).toHaveBeenCalled()
        expect(handlers.onTerminate).toHaveBeenCalled()
      }, done)
    })

    it('fire on resolution failure', (done) => {
      handlers.getRecords.andReturn([generateJob()])
      client.getStatus.andReturn(Promise.resolve(generateStatusSuccess()))
      client.getFile.andReturn(Promise.resolve('clearly invalid execution metadata'))
      worker.start(client, 0, 1000, handlers)
      defer(() => {
        expect(handlers.getRecords).toHaveBeenCalled()
        expect(handlers.onUpdate).toHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onTerminate).toNotHaveBeenCalled()
      }, done)
    })

    it('fire on termination', (done) => {
      handlers.getRecords.andReturn([])
      worker.start(client, 0, 1000, handlers)
      worker.terminate()
      defer(() => {
        expect(handlers.getRecords).toHaveBeenCalled()
        expect(handlers.onTerminate).toHaveBeenCalled()
        expect(handlers.onFailure).toNotHaveBeenCalled()
        expect(handlers.onUpdate).toNotHaveBeenCalled()
      }, done)
    })
  })

  describe('terminate()', function () {
    it('stops worker', () => {
      window.setInterval.andReturn(-1234)
      worker.start(client, 0, 1000, handlers)
      worker.terminate()
      expect(clearInterval).toHaveBeenCalledWith(-1234)
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
    getDeployment: createSpy(),
    getFile: createSpy(),
    getStatus: createSpy(),
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
    getRecords:  createSpy().andReturn([]),
    onFailure:   createSpy(),
    onTerminate: createSpy(),
    onUpdate:    createSpy(),
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
  return {
    ...JSON.parse(RESPONSE_JOB_ERROR).data,
    jobId,
  }
}

function generateStatusRunning(jobId = 'test-id') {
  return {
    ...JSON.parse(RESPONSE_JOB_RUNNING).data,
    jobId,
  }
}

function generateStatusSuccess(jobId = 'test-id') {
  return {
    ...JSON.parse(RESPONSE_JOB_SUCCESS).data,
    jobId,
  }
}

function defer(func, done, duration = 0) {
  return new Promise(resolve => setTimeout(resolve, duration))
    .then(func)
    .then(done)
    .catch(done)
}

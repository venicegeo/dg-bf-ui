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
import * as service from '../../src/api/update'
import * as worker from '../../src/api/workers/update'

describe('Update Service', () => {
  describe('startWorker()', () => {
    afterEach(() => {
      sinon.restore(worker.start)
      sinon.restore(worker.terminate)
    })

    it('starts worker', () => {
      const stub = sinon.stub(worker, 'start')
      service.startWorker({ onAvailable() {/* noop */} })
      assert.isFunction(stub.firstCall.args[0].onAvailable)
    })
  })

  describe('stopWorker()', () => {
    afterEach(() => {
      sinon.restore(worker.start)
      sinon.restore(worker.terminate)
    })

    it('stops worker', () => {
      const stub = sinon.stub(worker, 'terminate')
      sinon.stub(worker, 'start')
      service.startWorker({ onAvailable() {/* noop */} })
      service.stopWorker()
      assert.isTrue(stub.called)
    })
  })
})

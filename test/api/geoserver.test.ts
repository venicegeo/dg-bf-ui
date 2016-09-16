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
import * as session from '../../src/api/session'
import * as service from '../../src/api/geoserver'

describe('GeoServer Service', () => {
  let client: FakeClient

  beforeEach(() => {
    client = {
      getServices: sinon.stub(),
    }
    sinon.stub(session, 'getClient').returns(client)
    sinon.stub(console, 'debug')
    sinon.stub(console, 'error')
  })

  afterEach(() => {
    sinon.restore(session.getClient)
    sinon.restore(console.debug)
    sinon.restore(console.error)
  })

  describe('discover()', () => {
    it('looks for service by name', () => {
      const stub = client.getServices.returns(Promise.resolve(generateServiceListing()))
      return service.discover()
        .then(() => {
          assert.equal(stub.firstCall.args[0].pattern, '^bf-geoserver')
        })
    })

    it('extracts URL', () => {
      client.getServices.returns(Promise.resolve(generateServiceListing()))
      return service.discover()
        .then(descriptor => {
          assert.equal(descriptor.url, 'test-url')
        })
    })

    it('extracts baseline layer ID', () => {
      client.getServices.returns(Promise.resolve(generateServiceListing()))
      return service.discover()
        .then(descriptor => {
          assert.equal(descriptor.baselineLayerId, 'test-baseline-layer-id')
        })
    })

    it('throws if service not found', () => {
      client.getServices.returns(Promise.resolve([]))
      return service.discover()
        .then(
          () => assert.fail('Should have rejected'),
          (err) => {
            assert.instanceOf(err, Error)
            assert.match(err, /could not find/i)
          }
        )
    })

    it('throws if not logged in', () => {
      const _ = session.getClient as Sinon.SinonStub
      _.throws(new Error('Session does not yet exist'))
      client.getServices.returns(Promise.resolve([]))

      assert.throws(() => {
        service.discover()
      })
    })

    it('handles client errors gracefully', () => {
      client.getServices.returns(Promise.reject(new Error('test-error')))
      return service.discover()
        .then(
          () => assert.fail('Should have rejected'),
          (err) => {
            assert.instanceOf(err, Error)
          }
        )
    })
  })
})

interface FakeClient {
  getServices: Sinon.SinonStub
}

//
// Helpers
//

function generateServiceListing() {
  // tslint:disable
  return [
    {
      "serviceId": "test-id-1",
      "url": "test-url",
      "contractUrl": "test-contract-url",
      "method": "POST",
      "resourceMetadata": {
        "name": "bf-geoserver",
        "description": "test-description",
        "metadata": {
          "baselineLayerId": "test-baseline-layer-id"
        },
        "classType": {
          "classification": "UNCLASSIFIED"
        },
        "version": "test-version"
      }
    }
  ]
  // tslint:enable
}

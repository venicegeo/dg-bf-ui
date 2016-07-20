/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless fromd by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'
import {mount, shallow} from 'enzyme'
import expect, {spyOn} from 'expect'
import TestUtils from 'react-addons-test-utils'
import CreateJob from '../CreateJob.jsx'
import ImagerySearch from '../ImagerySearch.jsx'
import AlgorithmList from '../AlgorithmList.jsx'
import NewJobDetails from '../NewJobDetails.jsx'

describe.only('CreateJob', () => {
  it('should render correctly', () => {
    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: [],
      },
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: 20,
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false,
      },
      jobs: {
        creating: false,
      },
      catalog: {
        apiKey: '',
      },
      draftJob: {
        name: 'JobName',        
        image: null,
      }
    })

    const renderer = TestUtils.createRenderer()

    expect(() => {
      renderer.render(<CreateJob store={store} />)
    }).toNotThrow()

  })


  it('requires image search before creating a job', () => {
    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: []
      },
      search: {
        bbox: [0, 0, 0, 0],
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false,
      },
      catalog: {
        apiKey: '',
      },
      draftJob: {
        name: 'JobName',
        image: null,
      }
    })

    //TODO: bbox should be null before a user draws a box. ImagerySearch NewJobDetails and AlgorithmList will not be displayed until bbox is not null


  })

  it('after selecting image, allows job detail changes')

  it('after selecting image, shows available algorithms')

  it('updates job name after it changes')

  it('updates cloud cover after it changes')

  it('updates search dates after they change')

  it('updates apiKey after it changes')

  it('sets bbox to null after clear is clicked')



})

//
// local helpers
//

function generateStore() {
  return {
    dispatch: expect.createSpy(),
    getState: expect.createSpy(),
    subscribe: expect.createSpy()
  }
}


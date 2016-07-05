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

    const renderer = TestUtils.createRenderer()
    //const output = renderer.getRenderOutput()

    expect(() => {
      renderer.render(<CreateJob store={store} />)
    }).toNotThrow()

    //let [ImagerySearch, AlgorithmList, NewJobDetails ] = output.state.children
    //const wrapper = shallow(<CreateJob />);
    //const imagerySearch = wrapper.find('ImagerySearch')
    //expect(imagerySearch.prop('bbox').toEqual(null))
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

    const renderer = TestUtils.createRenderer()
    renderer.render(<CreateJob store={store} />)
    //const output = renderer.getRenderOutput()

    //let [ImagerySearch, AlgorithmList, NewJobDetails ] = output.state.children
    const wrapper = mount(<CreateJob store={store} />)
    const imagerySearch = wrapper.find(<li className='.CreateJob__placeholder'/>)
    console.log(imagerySearch.length)
    expect(imagerySearch.length).toEqual(1)
  })

  it('after selecting image, allows job detail changes')

  it('after selecting image, shows available algorithms')



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


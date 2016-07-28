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
import expect, {createSpy} from 'expect'
import CreateJob from 'app/components/CreateJob.jsx'
import ImagerySearch from 'app/components/ImagerySearch.jsx'
import AlgorithmList from 'app/components/AlgorithmList.jsx'
import NewJobDetails from 'app/components/NewJobDetails.jsx'


describe('<CreateJob/>', () => {
  it('should render correctly', () => {
    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: [1, 2]
      },
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: 20,
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false
      },
      jobs: {
        creating: false
      },
      catalog: {
        apiKey: ''
      },
      draftJob: {
        name: 'JobName',
        image: null
      }
    })

    const algoTester =[1, 2]

    const wrapper = shallow(<CreateJob store={store} algorithms={algoTester} />)
    expect(wrapper.props().selectedImage).toBe(null)
    expect(wrapper.props().algorithms).toEqual(algoTester)
    expect(wrapper.props().jobName).toEqual('JobName')

  })

  it('should render NewJobDetails correctly', () => {
    const actions = {
      onNameChange: createSpy()
    }
    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: [1, 2]
      },
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: 20,
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false
      },
      jobs: {
        creating: false
      },
      catalog: {
        apiKey: ''
      },
      draftJob: {
        name: 'JobName',
        image: null
      }
    })

    const algoTester =[1, 2]
    const wrapper = mount(<CreateJob store={store} algorithms={[algoTester]}/>)
    expect(wrapper.find(<NewJobDetails name='JobName' {...actions}/>)).toExist()
  })

  it('should render AlgorithmList correctly', () => {
    const actions = {
      onSubmit: createSpy()
    }
    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: [1, 2]
      },
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: 20,
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false
      },
      jobs: {
        creating: false
      },
      catalog: {
        apiKey: ''
      },
      draftJob: {
        name: 'JobName',
        image: null
      }
    })
    const imageProps = {
      acquiredDate: Date.now(),
      bands: {},
      cloudCover: 1.53,
      path: 'http://google.com',
      resolution: 30,
      sensorName: 'Landsat8',
      thumb_large: 'http://large',
      thumb_small: 'http://small'
    }

    const algoTester =[1, 2]
    const wrapper = mount(<CreateJob store={store} algorithms={[algoTester]}/>)
    expect(wrapper.find(<AlgorithmList imageProperties={imageProps} isSubmitting={false} algorithms={algoTester} store={store} {...actions}/>)).toExist()
  })

  it('should render ImagerySearch correctly', () => {
    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: [1, 2]
      },
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: 20,
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false
      },
      jobs: {
        creating: false
      },
      catalog: {
        apiKey: ''
      },
      draftJob: {
        name: 'JobName',
        image: null
      }
    })
    const actions = {
      onApiKeyChange: expect.createSpy(),
      onDateChange: expect.createSpy(),
      onClearBbox: expect.createSpy(),
      onCloudCoverChange: expect.createSpy(),
      onSubmit: expect.createSpy()
    }

    const algoTester =[1, 2]
    const wrapper = shallow(<CreateJob store={store} algorithms={algoTester}/>)
    expect(wrapper.find(<ImagerySearch bbox={[0, 0, 0, 0]} cloudCover={20} dateFrom={'2016-01-01'} dateTo={'2016-02-01'} isSearching={false} {...actions}/>)).toExist()
  })


  it('after selecting image, allows job detail changes', (done) => {
    const actions = {
      onNameChange: createSpy()
    }

    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: []
      },
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: 20,
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false
      },
      jobs: {
        creating: false
      },
      catalog: {
        apiKey: ''
      },
      draftJob: {
        name: 'JobName',
        image: {
          geometry: [[152.300, 61.185], [155.574, 60.644], [154.382, 58.983], [151.259, 59.509], [152.300, 61.187]],
          id: 'landsad:LC8110919191919919',
          properties: {
            acquiredDate: Date.now(),
            bands: { },
            cloudCover: 1.53,
            path: 'http://google.com',
            resolution: 30,
            sensorName: 'Landsat8',
            thumb_large: 'http://large',
            thumb_small: 'http://small'
          },
          type: 'Feature'
        }
      }
    })
    const algoTester =[1, 2]
    const spy = expect.spyOn(NewJobDetails.prototype, '_emitNameChange')
    const wrapper = mount(<CreateJob store={store} algorithms={algoTester}/>)
    expect(wrapper.find(<NewJobDetails name='JobName' {...actions}/>)).toExist()
    const newJobDetails = wrapper.find(NewJobDetails)
    expect(spy).toNotHaveBeenCalled()
    newJobDetails.find('input').simulate('change', {target: {value: 'Changed me!'}})
    expect(spy).toHaveBeenCalled()
    expect(wrapper.props().selectedImage).toNotBe(null)
    done()

  })

  it('after selecting image, shows available algorithms', (done) => {
    const algorithms = [{
      description: 'test description',
      id: 'test-algo-id',
      name: 'BF_Algo_Test_Name',
      requirements: [],
      type: 'test_type',
      url: 'http://testurl'
    }]

    const imageProps = {
      acquiredDate: Date.now(),
      bands: {},
      cloudCover: 1.53,
      path: 'http://google.com',
      resolution: 30,
      sensorName: 'Landsat8',
      thumb_large: 'http://large',
      thumb_small: 'http://small'
    }

    const store = generateStore()
    store.getState.andReturn({
      algorithms: {
        records: [{
          description: 'test description',
          id: 'test-algo-id',
          name: 'BF_Algo_Test_Name',
          requirements: [],
          type: 'test_type',
          url: 'http://testurl'
        }]
      },
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: 20,
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false
      },
      jobs: {
        creating: false
      },
      catalog: {
        apiKey: ''
      },
      draftJob: {
        name: 'JobName',
        image: {
          geometry: [[152.300, 61.185], [155.574, 60.644], [154.382, 58.983], [151.259, 59.509], [152.300, 61.187]],
          id: 'test-id',
          properties: {
            acquiredDate: Date.now(),
            bands: {},
            cloudCover: 1.53,
            path: 'http://google.com',
            resolution: 30,
            sensorName: 'Landsat8',
            thumb_large: 'http://large',
            thumb_small: 'http://small'
          },
          type: 'Feature'
        }
      }
    })

    const actions = {
      onSubmit: createSpy()
    }

    const algorithmsTest = {
      records: [{
        description: 'test description',
        id: 'test-algo-id',
        name: 'BF_Algo_Test_Name',
        requirements: [],
        type: 'test_type',
        url: 'http://testurl'
      }]
    }

    const wrapper = shallow(<CreateJob store={store} algorithms={algorithmsTest}/>)
    expect(wrapper.find(<AlgorithmList imageProperties={imageProps} isSubmitting={false} algorithms={algorithms} store={store} {...actions}/>)).toExist()
    expect(wrapper.props().algorithms).toNotBe(null)
    expect(wrapper.props().jobName).toEqual('JobName')
    expect(wrapper.props().selectedImage).toNotBe(null)
    done()
  })
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


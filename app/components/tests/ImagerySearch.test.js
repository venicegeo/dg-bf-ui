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
import ImagerySearch from '../ImagerySearch.jsx'

describe.only('ImagerySearch', () => {
  it('should render correctly', () => {
    const store = generateStore()

    ///   bbox:               React.PropTypes.array.isRequired,
    ///   catalogApiKey:      React.PropTypes.string,
    ///   cloudCover:         React.PropTypes.number.isRequired,
    ///   dateFrom:           React.PropTypes.string.isRequired,
    ///   dateTo:             React.PropTypes.string.isRequired,
    ///   error:              React.PropTypes.object,
    ///   isSearching:        React.PropTypes.bool.isRequired,
    //   onApiKeyChange:     React.PropTypes.func.isRequired,
    //   onDateChange:       React.PropTypes.func.isRequired,
    //   onClearBbox:        React.PropTypes.func.isRequired,
    //   onCloudCoverChange: React.PropTypes.func.isRequired,
    //   onSubmit:           React.PropTypes.func.isRequired
    store.getState.andReturn({
      search: {
        bbox: [0, 0, 0, 0],
        cloudCover: '20',
        dateFrom: '2016-01-01',
        dateTo: '2016-02-01',
        error: null,
        searching: false,
      },
      catalog: {
        apiKey: '',
      },
      onApiKeyChange: null,
      onDateChange: null,
      onClearBbox: null,
      onCloudCoverChange: null,
      onSubmit: null,

    })

    const renderer = TestUtils.createRenderer()
    //const output = renderer.getRenderOutput()

    expect(() => {
      renderer.render(<ImagerySearch store={store} />)
    }).toNotThrow()

    //let [ImagerySearch, AlgorithmList, NewJobDetails ] = output.state.children
    //const wrapper = shallow(<CreateJob />);
    //const imagerySearch = wrapper.find('ImagerySearch')
    //expect(imagerySearch.prop('bbox').toEqual(null))
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


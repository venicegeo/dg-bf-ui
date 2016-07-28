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

import React from 'react'
import {mount} from 'enzyme'
import expect from 'expect'
import ImagerySearch from 'app/components/ImagerySearch.jsx'


describe('<ImagerySearch/>', () => {
  it('should render correctly', () => {
    const actions = {
      onApiKeyChange: expect.createSpy(),
      onDateChange: expect.createSpy(),
      onClearBbox: expect.createSpy(),
      onCloudCoverChange: expect.createSpy(),
      onSubmit: expect.createSpy()
    }

    const component = mount(<ImagerySearch bbox={[0, 0, 0, 0]} cloudCover={20} dateFrom={'2016-01-01'} dateTo={'2016-02-01'} isSearching={false} {...actions}/>)
    expect(component.props().cloudCover).toEqual(20)
    expect(component.props().bbox).toEqual([0, 0, 0, 0])
  })

  it('updates cloud cover after it changes')

  it('updates search dates after they change')

  it('updates apiKey after it changes')

  it('clears minimap and sets bbox to null after clear is clicked')

})



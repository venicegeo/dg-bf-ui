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
import Algorithm from '../../app/components/Algorithm.jsx'

describe('<Algorithm/>', () => {
  it('is a div element', (done) => {
    const actions = {
      onSubmit: expect.createSpy()
    }
    const algorithmsTest =
        {
          description: 'test description',
          id: 'test-algo-id',
          name: 'BF_Algo_Test_Name',
          requirements: [{description: 'Coastal and Swir1', literal: 'coastal, swir1', name: 'Bands'}, {description: 'Less than 10%', literal: 10, name: 'Cloud Cover'}],
          type: 'test_type',
          url: 'http://testurl'
        }


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

    const component = mount(<Algorithm algorithm={algorithmsTest} imageProperties={imageProps} isSubmitting={false}  {...actions}/>)
    expect(component.props().algorithm).toEqual(algorithmsTest)
    expect(component.props().imageProperties).toEqual(imageProps)

    done()
  })

})





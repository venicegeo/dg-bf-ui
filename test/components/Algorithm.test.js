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





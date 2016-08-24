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
import {shallow} from 'enzyme'
import expect, {createSpy} from 'expect'
import AlgorithmList from '../../app/components/AlgorithmList'
import Algorithm from '../../app/components/Algorithm'

describe('<AlgorithmListList/>', () => {
  let _props

  beforeEach(() => {
    _props = {
      algorithms: [{
        description:  'test-description',
        id:           'test-id',
        name:         'test-name',
        requirements: []
      }],
      imageProperties: {
        bands: {},
        cloudCover: 5,
      },
      isSubmitting: false,
      selectedId: '',
      onSelect: createSpy(),
      onSubmit: createSpy(),
    }
  })

  it('renders', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={_props.algorithms}
        imageProperties={_props.imageProperties}
      />
    )
    expect(wrapper.find('.AlgorithmList-root').length).toEqual(1)
    expect(wrapper.find(Algorithm).length).toEqual(1)
  })

  it('can have multiple algorithms', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={[
          {
            description:  'test-description',
            id:           'test-algorithm-1',
            name:         'test-name',
            requirements: []
          },
          {
            description:  'test-description',
            id:           'test-algorithm-2',
            name:         'test-name',
            requirements: []
          },
        ]}
        imageProperties={_props.imageProperties}
      />
    )
    expect(wrapper.find(Algorithm).length).toEqual(2)
  })

  it('can have zero algorithms', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={[]}
        imageProperties={_props.imageProperties}
      />
    )
    expect(wrapper.find(Algorithm).length).toEqual(0)
  })

  it('can have selectable algorithms', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={_props.algorithms}
        imageProperties={_props.imageProperties}
        onSelect={_props.onSelect}
      />
    )
    expect(wrapper.find(Algorithm).prop('onSelect')).toBeA('function')
  })

  it('can have submittable algorithms', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={_props.algorithms}
        imageProperties={_props.imageProperties}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find(Algorithm).prop('onSubmit')).toBeA('function')
  })

  it('can have neither selectable nor submittable algorithms', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={_props.algorithms}
        imageProperties={_props.imageProperties}
      />
    )
    expect(wrapper.find(Algorithm).prop('onSelect')).toBe(undefined)
    expect(wrapper.find(Algorithm).prop('onSubmit')).toBe(undefined)
  })

  it('can have both selectable AND submittable algorithms', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={_props.algorithms}
        imageProperties={_props.imageProperties}
        onSelect={_props.onSelect}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find(Algorithm).prop('onSelect')).toBeA('function')
    expect(wrapper.find(Algorithm).prop('onSubmit')).toBeA('function')
  })

  it('indicates selected algorithm', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={[
          {
            description:  'test-description',
            id:           'test-algorithm-1',
            name:         'test-name',
            requirements: []
          },
          {
            description:  'test-description',
            id:           'test-algorithm-2',
            name:         'test-name',
            requirements: []
          },
        ]}
        imageProperties={_props.imageProperties}
        selectedId="test-algorithm-2"
        onSelect={_props.onSelect}
      />
    )
    expect(wrapper.find(Algorithm).at(0).prop('isSelected')).toBe(false)
    expect(wrapper.find(Algorithm).at(1).prop('isSelected')).toBe(true)
  })

  it('updates selected algorithm when props change', () => {
    const wrapper = shallow(
      <AlgorithmList
        algorithms={[
          {
            description:  'test-description',
            id:           'test-algorithm-1',
            name:         'test-name',
            requirements: []
          },
          {
            description:  'test-description',
            id:           'test-algorithm-2',
            name:         'test-name',
            requirements: []
          },
        ]}
        imageProperties={_props.imageProperties}
        selectedId="test-algorithm-2"
        onSelect={_props.onSelect}
      />
    )
    wrapper.setProps({ selectedId: 'test-algorithm-1' })
    expect(wrapper.find(Algorithm).at(0).prop('isSelected')).toBe(true)
    expect(wrapper.find(Algorithm).at(1).prop('isSelected')).toBe(false)
  })

  it('bubbles `onSubmit` event', () => {
    const [algorithm] = _props.algorithms
    const wrapper = shallow(
      <AlgorithmList
        algorithms={[algorithm]}
        imageProperties={_props.imageProperties}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.find(Algorithm).props().onSubmit(algorithm)
    expect(_props.onSubmit).toHaveBeenCalledWith(algorithm)
  })

  it('bubbles `onSelect` event', () => {
    const [algorithm] = _props.algorithms
    const wrapper = shallow(
      <AlgorithmList
        algorithms={[algorithm]}
        imageProperties={_props.imageProperties}
        onSelect={_props.onSelect}
      />
    )
    wrapper.find(Algorithm).props().onSelect(algorithm)
    expect(_props.onSelect).toHaveBeenCalledWith(algorithm)
  })
})

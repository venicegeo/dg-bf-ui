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
import Algorithm from 'app/components/Algorithm'

describe('<Algorithm/>', () => {
  let _props

  beforeEach(() => {
    _props = {
      algorithm: {
        description:  'test-description',
        name:         'test-name',
        requirements: [
          {
            name: 'Bands',
            description: 'test-description',
            literal: 'red,green',
          },
        ],
      },
      imageProperties: {
        bands: {},
        cloudCover: 5,
      },
      isSelected: false,
      isSubmitting: false,
      onSelect:  createSpy(),
      onSubmit:  createSpy(),
    }
  })

  it('renders', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
      />
    )
    expect(wrapper.find('.Algorithm-name').text()).toEqual('test-name')
    expect(wrapper.find('.Algorithm-description').text()).toEqual('test-description')
    expect(wrapper.find('.Algorithm-requirements tbody tr th').text()).toEqual('Bands')
    expect(wrapper.find('.Algorithm-requirements tbody tr td').text()).toEqual('test-description')
  })

  it('can be neither selectable nor submittable', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
      />
    )
    expect(wrapper.find('.Algorithm-selectionIndicator').length).toEqual(0)
    expect(wrapper.find('.Algorithm-startButton').length).toEqual(0)
  })

  it('can be selectable', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        onSelect={_props.onSelect}
      />
    )
    expect(wrapper.find('.Algorithm-selectionIndicator').length).toEqual(1)
  })

  it('can be submittable', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find('.Algorithm-startButton').length).toEqual(1)
  })

  it('can be selectable AND submittable', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        onSelect={_props.onSelect}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find('.Algorithm-selectionIndicator').length).toEqual(1)
    expect(wrapper.find('.Algorithm-startButton').length).toEqual(1)
  })

  it('prevents new submissions while submission in flight', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        isSubmitting={true}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find('.Algorithm-startButton').prop('disabled')).toEqual(true)
  })

  it('shows as `selected` appropriately', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        isSelected={true}
        onSelect={_props.onSelect}
      />
    )
    expect(wrapper.find('.Algorithm-selectionIndicator').prop('checked')).toEqual(true)
  })

  it('emits `onSelect` event', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        isSelected={_props.isSelected}
        onSelect={_props.onSelect}
      />
    )
    wrapper.find('.Algorithm-selectionIndicator').simulate('click')
    expect(_props.onSelect).toHaveBeenCalled()
  })

  it('does not emit `onSelect` event if already selected', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        isSelected={true}
        onSelect={_props.onSelect}
      />
    )
    wrapper.find('.Algorithm-selectionIndicator').simulate('click')
    expect(_props.onSelect).toNotHaveBeenCalled()
  })

  it('emits `onSubmit` event', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.find('.Algorithm-startButton').simulate('click')
    expect(_props.onSubmit).toHaveBeenCalled()
  })

  it('verifies image compatibility (meets all requirements)', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={{
          description:  'test-description',
          name:         'test-name',
          requirements: [
            {
              name: 'Bands',
              description: 'test-description',
              literal: 'red,green',
            },
            {
              name: 'Cloud Cover',
              description: 'test-description',
              literal: 10,
            },
          ],
        }}
        imageProperties={{
          bands: {
            red: 'lorem',
            green: 'lorem',
          },
          cloudCover: 5,
        }}
      />
    )
    expect(wrapper.find('.Algorithm-root').hasClass('Algorithm-isCompatible')).toEqual(true)
    expect(wrapper.find('.Algorithm-requirements tbody tr').at(0).hasClass('Algorithm-met')).toEqual(true)
    expect(wrapper.find('.Algorithm-requirements tbody tr').at(1).hasClass('Algorithm-met')).toEqual(true)
  })

  it('verifies image compatibility (meets some requirements)', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={{
          description:  'test-description',
          name:         'test-name',
          requirements: [
            {
              name: 'Bands',
              description: 'test-description',
              literal: 'red,green',
            },
            {
              name: 'Cloud Cover',
              description: 'test-description',
              literal: 9000,
            },
          ],
        }}
        imageProperties={{
          bands: {
            red: 'lorem',
            green: 'lorem',
          },
          cloudCover: 9001,
        }}
      />
    )
    expect(wrapper.find('.Algorithm-root').hasClass('Algorithm-isNotCompatible')).toEqual(true)
    expect(wrapper.find('.Algorithm-requirements tbody tr').at(0).hasClass('Algorithm-met')).toEqual(true)
    expect(wrapper.find('.Algorithm-requirements tbody tr').at(1).hasClass('Algorithm-unmet')).toEqual(true)
  })

  it('verifies image compatibility (meets no requirements)', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={{
          description:  'test-description',
          name:         'test-name',
          requirements: [
            {
              name: 'Bands',
              description: 'test-description',
              literal: 'red,green',
            },
            {
              name: 'Cloud Cover',
              description: 'test-description',
              literal: 9000,
            },
          ],
        }}
        imageProperties={{
          bands: {
            hotpink: 'lorem',
            fuschia: 'lorem',
          },
          cloudCover: 9001,
        }}
      />
    )
    expect(wrapper.find('.Algorithm-root').hasClass('Algorithm-isNotCompatible')).toEqual(true)
    expect(wrapper.find('.Algorithm-requirements tbody tr').at(0).hasClass('Algorithm-unmet')).toEqual(true)
    expect(wrapper.find('.Algorithm-requirements tbody tr').at(1).hasClass('Algorithm-unmet')).toEqual(true)
  })

  it('supports custom compatibility warnings', () => {
    const wrapper = shallow(
      <Algorithm
        algorithm={_props.algorithm}
        imageProperties={_props.imageProperties}
        warningHeading="test-warning-heading"
        warningMessage="test-warning-message"
        isSubmitting={true}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find('.Algorithm-compatibilityWarning h4').text().trim()).toEqual('test-warning-heading')
    expect(wrapper.find('.Algorithm-compatibilityWarning p').text().trim()).toEqual('test-warning-message')
  })
})

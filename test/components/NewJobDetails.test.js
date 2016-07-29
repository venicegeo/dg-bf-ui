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
import expect, {createSpy} from 'expect'
import NewJobDetails from 'app/components/NewJobDetails.jsx'

describe('<NewJobDetails/>', () => {
  let _props

  beforeEach(() => {
    _props = {
      name: 'test-name',
      onNameChange: createSpy(),
    }
  })

  it('renders', () => {
    const wrapper = mount(
      <NewJobDetails
        name={_props.name}
        onNameChange={_props.onNameChange}
      />
    )
    expect(wrapper.find('input').get(0).value).toEqual('test-name')
  })

  it('emits change event', () => {
    const wrapper = mount(
      <NewJobDetails
        name={_props.name}
        onNameChange={_props.onNameChange}
      />
    )
    const input = wrapper.find('input')
    input.get(0).value = 'test-new-value'
    input.simulate('change')
    expect(_props.onNameChange).toHaveBeenCalledWith('test-new-value')
  })

  it('updates name when props change', () => {
    const wrapper = mount(
      <NewJobDetails
        name={_props.name}
        onNameChange={_props.onNameChange}
      />
    )
    wrapper.setProps({name: 'test-new-value'})
    expect(wrapper.find('input').get(0).value).toEqual('test-new-value')
  })
})



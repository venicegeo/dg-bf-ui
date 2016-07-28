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
import NewJobDetails from 'app/components/NewJobDetails.jsx'

describe('<NewJobDetails/>', () => {
  it('should change Job Name', () => {
    const actions = {
      onNameChange: expect.createSpy()
    }
    const spy = expect.spyOn(NewJobDetails.prototype, '_emitNameChange')
    const component = mount(
      <NewJobDetails name={'Test Job'} {...actions} />
    )
    expect(component.props().name).toEqual('Test Job')
    component.update()
    expect(spy).toNotHaveBeenCalled()
    component.find('input').simulate('change', {target: {value: 'Changed me!'}})
    expect(spy).toHaveBeenCalled()
  })
})



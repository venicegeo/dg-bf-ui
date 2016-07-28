import React from 'react'
import {mount} from 'enzyme'
import expect from 'expect'
import NewJobDetails from 'app/components/NewJobDetails.jsx'

describe('NewJobDetails', () => {
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



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

import * as React from 'react'
import {mount} from 'enzyme'
import {assert} from 'chai'
import * as sinon from 'sinon'
import ImagerySearch from 'app/components/ImagerySearch'

describe('<ImagerySearch/>', () => {
  let _props

  beforeEach(() => {
    _props = {
      bbox:               [0, 0, 0, 0],
      catalogApiKey:      'test-catalog-api-key',
      cloudCover:         19,
      dateFrom:           '2016-01-01',
      dateTo:             '2016-02-01',
      filter:             '',
      filters:            [],
      isSearching:        false,
      onApiKeyChange:     sinon.stub(),
      onClearBbox:        sinon.stub(),
      onCloudCoverChange: sinon.stub(),
      onDateChange:       sinon.stub(),
      onFilterChange:     sinon.stub(),
      onSubmit:           sinon.stub(),
    }
  })

  it('renders', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    assert.equal(wrapper.find('.ImagerySearch__catalogApiKey input').get(0).value, 'test-catalog-api-key')
    assert.equal(wrapper.find('.ImagerySearch__cloudCover input').get(0).value, '19')
    assert.equal(wrapper.find('.ImagerySearch__captureDateFrom input').get(0).value, '2016-01-01')
    assert.equal(wrapper.find('.ImagerySearch__captureDateTo input').get(0).value, '2016-02-01')
    assert.equal(wrapper.find('.ImagerySearch__spatialFilter select').get(0).value, '')
  })

  it('renders spatial filter options', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={'test-id'}
        filters={[
          {id: 'test-id', name: 'Testing'},
        ]}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    const options = wrapper.find('.ImagerySearch__spatialFilter option')
    assert.equal(wrapper.find('.ImagerySearch__spatialFilter select').get(0).value, 'test-id')
    assert.equal(options.get(0).value, '')
    assert.equal(options.at(0).text(), 'None')
    assert.equal(options.get(1).value, 'test-id')
    assert.equal(options.at(1).text(), 'Testing')
  })

  it('normalizes spatial filter names', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={[
          {id: 'test-filter-1', name: 'lorem ipsum'},
          {id: 'test-filter-2', name: 'dolor sit amet'},
        ]}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    assert.equal(wrapper.find('.ImagerySearch__spatialFilter option').at(1).text(), 'Lorem Ipsum')
    assert.equal(wrapper.find('.ImagerySearch__spatialFilter option').at(2).text(), 'Dolor Sit Amet')
  })

  it('renders with correct initial spatial filter selection', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={'test-filter-1'}
        filters={[
          {id: 'test-filter-1', name: 'test-name'},
          {id: 'test-filter-2', name: 'dolor sit amet'},
        ]}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    assert.equal(wrapper.find('.ImagerySearch__spatialFilter select').get(0).value, 'test-filter-1')
  })

  it('emits api key change event', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    const input = wrapper.find('.ImagerySearch__catalogApiKey input')
    input.get(0).value = 'test-new-catalog-api-key'
    input.simulate('change')
    assert.isTrue(_props.onApiKeyChange.calledWithExactly('test-new-catalog-api-key'))
  })

  it('emits bbox clear event', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.find('.ImagerySearch__clearBbox').simulate('click')
    assert.equal(_props.onClearBbox.callCount, 1)
  })

  it('emits cloud cover change event', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    const input = wrapper.find('.ImagerySearch__cloudCover input')
    input.get(0).value = 42
    input.simulate('change')
    assert.isTrue(_props.onCloudCoverChange.calledWithExactly(42))
  })

  it('emits date change event (via "from" date)', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    const input = wrapper.find('.ImagerySearch__captureDateFrom input')
    input.get(0).value = '1999-12-31'
    input.simulate('change')
    assert.isTrue(_props.onDateChange.calledWithExactly('1999-12-31', _props.dateTo))
  })

  it('emits date change event (via "to" date)', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    const input = wrapper.find('.ImagerySearch__captureDateTo input')
    input.get(0).value = '1999-12-31'
    input.simulate('change')
    assert.isTrue(_props.onDateChange.calledWithExactly(_props.dateFrom, '1999-12-31'))
  })

  it('emits spatial filter change event', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={''}
        filters={[
          {id: 'test-id', name: 'Testing'},
        ]}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    const dropdown = wrapper.find('.ImagerySearch__spatialFilter select')
    dropdown.get(0).value = 'test-id'
    dropdown.simulate('change')
    assert.isTrue(_props.onFilterChange.calledWithExactly('test-id'))
  })

  it('emits spatial filter change event (to empty)', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={'test-id'}
        filters={[
          {id: 'test-id', name: 'Testing'},
        ]}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    const dropdown = wrapper.find('.ImagerySearch__spatialFilter select')
    dropdown.get(0).value = ''
    dropdown.simulate('change')
    assert.isTrue(_props.onFilterChange.calledWithExactly(null))
  })

  it('emits submission event', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.find('form').simulate('submit')
    assert.equal(_props.onSubmit.callCount, 1)
  })

  it('updates api key when props change', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.setProps({catalogApiKey: 'test-new-catalog-api-key'})
    assert.equal(wrapper.find('.ImagerySearch__catalogApiKey input').get(0).value, 'test-new-catalog-api-key')
  })

  it('updates cloud cover when props change', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.setProps({cloudCover: 42})
    assert.equal(wrapper.find('.ImagerySearch__cloudCover input').get(0).value, '42')
  })

  it('updates date when props change (via "from" date)', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.setProps({dateFrom: '1999-12-31'})
    assert.equal(wrapper.find('.ImagerySearch__captureDateFrom input').get(0).value, '1999-12-31')
    assert.equal(wrapper.find('.ImagerySearch__captureDateTo input').get(0).value, _props.dateTo)
  })

  it('updates date when props change (via "to" date)', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.setProps({dateTo: '1999-12-31'})
    assert.equal(wrapper.find('.ImagerySearch__captureDateFrom input').get(0).value, _props.dateFrom)
    assert.equal(wrapper.find('.ImagerySearch__captureDateTo input').get(0).value, '1999-12-31')
  })

  it('updates spatial filter when props change', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={''}
        filters={[
          {id: 'test-id', name: 'Testing'},
        ]}
        isSearching={_props.isSearching}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    wrapper.setProps({filter: 'test-id'})
    assert.equal(wrapper.find('.ImagerySearch__spatialFilter select').get(0).value, 'test-id')
  })

  it('shows loading indicator while search is in flight')
  it('prevents button hammering while search is in flight')
})

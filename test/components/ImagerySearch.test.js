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
      onApiKeyChange:     createSpy(),
      onClearBbox:        createSpy(),
      onCloudCoverChange: createSpy(),
      onDateChange:       createSpy(),
      onFilterChange:     createSpy(),
      onSubmit:           createSpy(),
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
    expect(wrapper.find('.ImagerySearch-catalogApiKey input').get(0).value).toEqual('test-catalog-api-key')
    expect(wrapper.find('.ImagerySearch-cloudCover input').get(0).value).toEqual('19')
    expect(wrapper.find('.ImagerySearch-captureDateFrom input').get(0).value).toEqual('2016-01-01')
    expect(wrapper.find('.ImagerySearch-captureDateTo input').get(0).value).toEqual('2016-02-01')
    expect(wrapper.find('.ImagerySearch-spatialFilter select').get(0).value).toEqual('')
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
    const options = wrapper.find('.ImagerySearch-spatialFilter option')
    expect(wrapper.find('.ImagerySearch-spatialFilter select').get(0).value).toEqual('test-id')
    expect(options.get(0).value).toEqual('')
    expect(options.at(0).text()).toEqual('None')
    expect(options.get(1).value).toEqual('test-id')
    expect(options.at(1).text()).toEqual('Testing')
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
    expect(wrapper.find('.ImagerySearch-spatialFilter option').at(1).text()).toEqual('Lorem Ipsum')
    expect(wrapper.find('.ImagerySearch-spatialFilter option').at(2).text()).toEqual('Dolor Sit Amet')
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
    expect(wrapper.find('.ImagerySearch-spatialFilter select').get(0).value).toEqual('test-filter-1')
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
    const input = wrapper.find('.ImagerySearch-catalogApiKey input')
    input.get(0).value = 'test-new-catalog-api-key'
    input.simulate('change')
    expect(_props.onApiKeyChange).toHaveBeenCalledWith('test-new-catalog-api-key')
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
    wrapper.find('.ImagerySearch-clearBbox').simulate('click')
    expect(_props.onClearBbox).toHaveBeenCalled()
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
    const input = wrapper.find('.ImagerySearch-cloudCover input')
    input.get(0).value = 42
    input.simulate('change')
    expect(_props.onCloudCoverChange).toHaveBeenCalledWith(42)
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
    const input = wrapper.find('.ImagerySearch-captureDateFrom input')
    input.get(0).value = '1999-12-31'
    input.simulate('change')
    expect(_props.onDateChange).toHaveBeenCalledWith('1999-12-31', _props.dateTo)
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
    const input = wrapper.find('.ImagerySearch-captureDateTo input')
    input.get(0).value = '1999-12-31'
    input.simulate('change')
    expect(_props.onDateChange).toHaveBeenCalledWith(_props.dateFrom, '1999-12-31')
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
    const dropdown = wrapper.find('.ImagerySearch-spatialFilter select')
    dropdown.get(0).value = 'test-id'
    dropdown.simulate('change')
    expect(_props.onFilterChange).toHaveBeenCalledWith('test-id')
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
    const dropdown = wrapper.find('.ImagerySearch-spatialFilter select')
    dropdown.get(0).value = ''
    dropdown.simulate('change')
    expect(_props.onFilterChange).toHaveBeenCalledWith(null)
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
    expect(_props.onSubmit).toHaveBeenCalled()
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
    expect(wrapper.find('.ImagerySearch-catalogApiKey input').get(0).value).toEqual('test-new-catalog-api-key')
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
    expect(wrapper.find('.ImagerySearch-cloudCover input').get(0).value).toEqual('42')
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
    expect(wrapper.find('.ImagerySearch-captureDateFrom input').get(0).value).toEqual('1999-12-31')
    expect(wrapper.find('.ImagerySearch-captureDateTo input').get(0).value).toEqual(_props.dateTo)
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
    expect(wrapper.find('.ImagerySearch-captureDateFrom input').get(0).value).toEqual(_props.dateFrom)
    expect(wrapper.find('.ImagerySearch-captureDateTo input').get(0).value).toEqual('1999-12-31')
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
    expect(wrapper.find('.ImagerySearch-spatialFilter select').get(0).value).toEqual('test-id')
  })

  it('shows loading indicator while search is in flight')
  it('prevents button hammering while search is in flight')
})

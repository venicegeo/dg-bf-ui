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
import {mount, shallow} from 'enzyme'
import expect, {createSpy} from 'expect'
import CatalogSearchCriteria from 'app/components/CatalogSearchCriteria'
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
    const wrapper = shallow(
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
    expect(wrapper.find(CatalogSearchCriteria).length).toEqual(1)
    expect(wrapper.find('button[type="submit"]').length).toEqual(1)
  })

  it('bubbles api key change event', () => {
    const wrapper = shallow(
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
    wrapper.find(CatalogSearchCriteria).props().onApiKeyChange('test-new-catalog-api-key')
    expect(_props.onApiKeyChange).toHaveBeenCalledWith('test-new-catalog-api-key')
  })

  it('bubbles bbox clear event', () => {
    const wrapper = shallow(
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
    wrapper.find(CatalogSearchCriteria).props().onClearBbox()
    expect(_props.onClearBbox).toHaveBeenCalled()
  })

  it('bubbles cloud cover change event', () => {
    const wrapper = shallow(
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
    wrapper.find(CatalogSearchCriteria).props().onCloudCoverChange(42)
    expect(_props.onCloudCoverChange).toHaveBeenCalledWith(42)
  })

  it('bubbles date change event (via "from" date)', () => {
    const wrapper = shallow(
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
    wrapper.find(CatalogSearchCriteria).props().onDateChange('1999-12-31', _props.dateTo)
    expect(_props.onDateChange).toHaveBeenCalledWith('1999-12-31', _props.dateTo)
  })

  it('bubbles date change event (via "to" date)', () => {
    const wrapper = shallow(
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
    wrapper.find(CatalogSearchCriteria).props().onDateChange(_props.dateFrom, '1999-12-31')
    expect(_props.onDateChange).toHaveBeenCalledWith(_props.dateFrom, '1999-12-31')
  })

  it('bubbles spatial filter change event', () => {
    const wrapper = shallow(
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
    wrapper.find(CatalogSearchCriteria).props().onFilterChange('test-id')
    expect(_props.onFilterChange).toHaveBeenCalledWith('test-id')
  })

  it('bubbles spatial filter change event (to empty)', () => {
    const wrapper = shallow(
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
    wrapper.find(CatalogSearchCriteria).props().onFilterChange(null)
    expect(_props.onFilterChange).toHaveBeenCalledWith(null)
  })

  it('emits submission event', () => {
    const wrapper = shallow(
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
    const noop = () => {}
    wrapper.find('form').simulate('submit', { preventDefault: noop, stopPropagation: noop })
    expect(_props.onSubmit).toHaveBeenCalled()
  })

  it('shows error message if exists', () => {
    const wrapper = mount(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        error={{
          message: 'oh noes',
          stack: 'paper',
          code: 123
        }}
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
    expect(wrapper.find('.ImagerySearch-errorMessage').length).toEqual(1)
  })

  it('shows loading indicator while search is in flight', () => {
    const wrapper = shallow(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={true}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find('.ImagerySearch-loadingMask').length).toEqual(1)
  })

  it('prevents button hammering while search is in flight', () => {
    const wrapper = shallow(
      <ImagerySearch
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        filter={_props.filter}
        filters={_props.filters}
        isSearching={true}
        onApiKeyChange={_props.onApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onCloudCoverChange={_props.onCloudCoverChange}
        onDateChange={_props.onDateChange}
        onFilterChange={_props.onFilterChange}
        onSubmit={_props.onSubmit}
      />
    )
    expect(wrapper.find('button[type="submit"]').prop('disabled')).toEqual(true)
  })
})

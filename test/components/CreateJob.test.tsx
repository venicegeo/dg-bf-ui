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
import {shallow} from 'enzyme'
import {assert} from 'chai'
import * as sinon from 'sinon'
import {CreateJob} from '../../src/components/CreateJob'

describe('<CreateJob/>', () => {
  let _props

  beforeEach(() => {
    _props = {
      algorithms:               [],
      bbox:                     [0, 0, 0, 0],
      catalogApiKey:            'test-catalog-api-key',
      executorServiceId:        'test-executor-service-id',
      filter:                   '',
      filters:                  [],
      isSearching:              false,
      searchCriteria: {
        cloudCover: 10,
        dateFrom:   '2016-01-01',
        dateTo:     '2016-12-31',
        filter:     '',
      },
      searchError: null,
      selectedImage: {
        id: 'test-id',
        properties: {},
      },
      onCatalogApiKeyChange:  sinon.stub(),
      onClearBbox:            sinon.stub(),
      onJobCreated:           sinon.stub(),
      onSearchCriteriaChange: sinon.stub(),
      onSearchSubmit:         sinon.stub(),
    }
  })

  it('renders', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        executorServiceId={_props.executorServiceId}
        filters={_props.filters}
        isSearching={_props.isSearching}
        searchCriteria={_props.searchCriteria}
        searchError={_props.searchError}
        selectedImage={_props.selectedImage}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobCreated={_props.onJobCreated}
        onSearchCriteriaChange={_props.onSearchCriteriaChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob-root').length, 1)
    assert.equal(wrapper.find('.CreateJob-placeholder').length, 0)
    assert.equal(wrapper.find('.CreateJob-search').length, 1)
    assert.equal(wrapper.find('.CreateJob-details').length, 1)
    assert.equal(wrapper.find('.CreateJob-algorithms').length, 1)
  })

  it('shows placeholder if bbox does not exist', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={null}
        catalogApiKey={_props.catalogApiKey}
        executorServiceId={_props.executorServiceId}
        filters={_props.filters}
        isSearching={_props.isSearching}
        searchCriteria={_props.searchCriteria}
        searchError={_props.searchError}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobCreated={_props.onJobCreated}
        onSearchCriteriaChange={_props.onSearchCriteriaChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob-placeholder').length, 1)
  })

  it('hides imagery search if no bbox exists', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={null}
        catalogApiKey={_props.catalogApiKey}
        executorServiceId={_props.executorServiceId}
        filters={_props.filters}
        isSearching={_props.isSearching}
        searchCriteria={_props.searchCriteria}
        searchError={_props.searchError}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobCreated={_props.onJobCreated}
        onSearchCriteriaChange={_props.onSearchCriteriaChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob-search').length, 0)
  })

  it('hides job details if no image is selected', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        executorServiceId={_props.executorServiceId}
        filters={_props.filters}
        isSearching={_props.isSearching}
        searchCriteria={_props.searchCriteria}
        searchError={_props.searchError}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobCreated={_props.onJobCreated}
        onSearchCriteriaChange={_props.onSearchCriteriaChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob-details').length, 0)
  })

  it('hides algorithms if no image is selected', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        executorServiceId={_props.executorServiceId}
        filters={_props.filters}
        isSearching={_props.isSearching}
        searchCriteria={_props.searchCriteria}
        searchError={_props.searchError}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobCreated={_props.onJobCreated}
        onSearchCriteriaChange={_props.onSearchCriteriaChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob-algorithms').length, 0)
  })

  it('emits `onCatalogApiKeyChange` event')
  it('emits `onClearBbox` event')
  it('emits `onJobCreated` event')
  it('emits `onSearchSubmit` event')
  it('emits `onSearchCriteriaChange` event')
})

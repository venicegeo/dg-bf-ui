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
import {CreateJob} from 'app/components/CreateJob'

describe('<CreateJob/>', () => {
  let _props

  beforeEach(() => {
    _props = {
      algorithms:               [],
      bbox:                     [0, 0, 0, 0],
      catalogApiKey:            'test-catalog-api-key',
      cloudCover:               10,
      dateFrom:                 '2016-01-01',
      dateTo:                   '2016-12-31',
      filter:                   '',
      filters:                  [],
      isCreating:               false,
      isSearching:              false,
      jobName:                  'test-name',
      searchError:              null,
      selectedImage:            {
        id:         'test-id',
        properties: {},
      },
      onCatalogApiKeyChange:    sinon.stub(),
      onClearBbox:              sinon.stub(),
      onJobSubmit:              sinon.stub(),
      onNameChange:             sinon.stub(),
      onResetName:              sinon.stub(),
      onSearchCloudCoverChange: sinon.stub(),
      onSearchDateChange:       sinon.stub(),
      onSearchFilterChange:     sinon.stub(),
      onSearchSubmit:           sinon.stub(),
    }
  })

  it('renders', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        searchError={_props.searchError}
        filter={_props.filter}
        filters={_props.filters}
        isCreating={_props.isCreating}
        isSearching={_props.isSearching}
        jobName={_props.jobName}
        selectedImage={_props.selectedImage}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobSubmit={_props.onJobSubmit}
        onNameChange={_props.onNameChange}
        onResetName={_props.onResetName}
        onSearchCloudCoverChange={_props.onSearchCloudCoverChange}
        onSearchDateChange={_props.onSearchDateChange}
        onSearchFilterChange={_props.onSearchFilterChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob__root').length, 1)
    assert.equal(wrapper.find('.CreateJob__placeholder').length, 0)
    assert.equal(wrapper.find('.CreateJob__search').length, 1)
    assert.equal(wrapper.find('.CreateJob__details').length, 1)
    assert.equal(wrapper.find('.CreateJob__algorithms').length, 1)
  })

  it('shows placeholder if bbox does not exist', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={null}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        searchError={_props.searchError}
        filter={_props.filter}
        filters={_props.filters}
        isCreating={_props.isCreating}
        isSearching={_props.isSearching}
        jobName={_props.jobName}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobSubmit={_props.onJobSubmit}
        onNameChange={_props.onNameChange}
        onResetName={_props.onResetName}
        onSearchCloudCoverChange={_props.onSearchCloudCoverChange}
        onSearchDateChange={_props.onSearchDateChange}
        onSearchFilterChange={_props.onSearchFilterChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob__placeholder').length, 1)
  })

  it('hides imagery search if no bbox exists', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={null}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        searchError={_props.searchError}
        filter={_props.filter}
        filters={_props.filters}
        isCreating={_props.isCreating}
        isSearching={_props.isSearching}
        jobName={_props.jobName}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobSubmit={_props.onJobSubmit}
        onNameChange={_props.onNameChange}
        onResetName={_props.onResetName}
        onSearchCloudCoverChange={_props.onSearchCloudCoverChange}
        onSearchDateChange={_props.onSearchDateChange}
        onSearchFilterChange={_props.onSearchFilterChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob__search').length, 0)
  })

  it('hides job details if no image is selected', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        searchError={_props.searchError}
        filter={_props.filter}
        filters={_props.filters}
        isCreating={_props.isCreating}
        isSearching={_props.isSearching}
        jobName={_props.jobName}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobSubmit={_props.onJobSubmit}
        onNameChange={_props.onNameChange}
        onResetName={_props.onResetName}
        onSearchCloudCoverChange={_props.onSearchCloudCoverChange}
        onSearchDateChange={_props.onSearchDateChange}
        onSearchFilterChange={_props.onSearchFilterChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob__details').length, 0)
  })

  it('hides algorithms if no image is selected', () => {
    const wrapper = shallow(
      <CreateJob
        algorithms={_props.algorithms}
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        cloudCover={_props.cloudCover}
        dateFrom={_props.dateFrom}
        dateTo={_props.dateTo}
        searchError={_props.searchError}
        filter={_props.filter}
        filters={_props.filters}
        isCreating={_props.isCreating}
        isSearching={_props.isSearching}
        jobName={_props.jobName}
        selectedImage={null}
        onCatalogApiKeyChange={_props.onCatalogApiKeyChange}
        onClearBbox={_props.onClearBbox}
        onJobSubmit={_props.onJobSubmit}
        onNameChange={_props.onNameChange}
        onResetName={_props.onResetName}
        onSearchCloudCoverChange={_props.onSearchCloudCoverChange}
        onSearchDateChange={_props.onSearchDateChange}
        onSearchFilterChange={_props.onSearchFilterChange}
        onSearchSubmit={_props.onSearchSubmit}
      />
    )
    assert.equal(wrapper.find('.CreateJob__algorithms').length, 0)
  })
})

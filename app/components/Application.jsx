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

const styles = require('./Application.css')

import React, {Component} from 'react'
import {render} from 'react-dom'
import debounce from 'lodash/debounce'
import {About} from './About'
import {CreateJob, createSearchCriteria} from './CreateJob'
import {CreateProductLine} from './CreateProductLine'
import {Help} from './Help'
import {JobStatusList} from './JobStatusList'
import {Login} from './Login'
import {Navigation} from './Navigation'
import {
  PrimaryMap,
  MODE_DRAW_BBOX,
  MODE_NORMAL,
  MODE_SELECT_IMAGERY,
  MODE_PRODUCT_LINES
} from './PrimaryMap'
import {ProductLineList} from './ProductLineList'
import * as algorithmsService from '../api/algorithms'
import * as jobsService from '../api/jobs'
import * as catalogService from '../api/catalog'
import * as executorService from '../api/executor'
import * as geoserverService from '../api/geoserver'
import * as productLinesService from '../api/productLines'
import {createCollection} from '../utils/collections'

import {
  KEY_TYPE,
  KEY_STATUS,
  STATUS_SUCCESS,
  TYPE_JOB,
  TYPE_SCENE,
} from '../constants'

export const createApplication = (element) => render(
  <Application
    deserialize={generateInitialState}
    serialize={debounce(serialize, 100)}
  />, element)

export class Application extends Component {
  constructor(props) {
    super(props)
    this.state = props.deserialize()
    this._handleBoundingBoxChange = this._handleBoundingBoxChange.bind(this)
    this._handleCatalogApiKeyChange = this._handleCatalogApiKeyChange.bind(this)
    this._handleClearBbox = this._handleClearBbox.bind(this)
    this._handleDismissJobError = this._handleDismissJobError.bind(this)
    this._handleFetchProductLines = this._handleFetchProductLines.bind(this)
    this._handleFetchProductLineJobs = this._handleFetchProductLineJobs.bind(this)
    this._handleForgetJob = this._handleForgetJob.bind(this)
    this._handleJobCreated = this._handleJobCreated.bind(this)
    this._handleProductLineCreated = this._handleProductLineCreated.bind(this)
    this._handleProductLineJobHoverIn = this._handleProductLineJobHoverIn.bind(this)
    this._handleProductLineJobHoverOut = this._handleProductLineJobHoverOut.bind(this)
    this._handleProductLineJobSelect = this._handleProductLineJobSelect.bind(this)
    this._handleProductLineJobDeselect = this._handleProductLineJobDeselect.bind(this)
    this._handleSearchCriteriaChange = this._handleSearchCriteriaChange.bind(this)
    this._handleSearchSubmit = this._handleSearchSubmit.bind(this)
    this._handleSelectFeature = this._handleSelectFeature.bind(this)
    this.navigateTo = this.navigateTo.bind(this)
  }

  componentDidUpdate(_, prevState) {
    if (!prevState.sessionToken && this.state.sessionToken) {
      this._autodiscoverServices()
      this._startJobsWorker()
    }
    this.props.serialize(this.state)
  }

  componentWillMount() {
    this._subscribeToHistoryEvents()
    if (this.state.sessionToken) {
      this._autodiscoverServices()
      this._startJobsWorker()
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <Navigation
          activeRoute={this.state.route}
          onClick={this.navigateTo}
        />
        <PrimaryMap
          geoserverUrl={this.state.geoserver.url}
          frames={this._frames}
          detections={this._detections}
          imagery={this.state.searchResults}
          isSearching={false}
          view={this.state.mapView}
          catalogApiKey={this.state.catalogApiKey}
          bbox={this.state.bbox}
          mode={this._mapMode}
          selectedFeature={this.state.selectedFeature}
          highlightedFeature={this.state.hoveredFeature}
          onBoundingBoxChange={this._handleBoundingBoxChange}
          onSearchPageChange={this._handleSearchSubmit}
          onSelectFeature={this._handleSelectFeature}
          onViewChange={mapView => this.setState({ mapView })}
        />
        {this.renderRoute()}
      </div>
    )
  }

  renderRoute() {
    if (!this.state.sessionToken) {
      return (
        <Login
          onError={err => this.setState({ error: err })}
          onSuccess={sessionToken => this.setState({ sessionToken })}
        />
      )
    }
    switch (this.state.route.pathname) {
      case '/about':
        return (
          <About
            onDismiss={() => this.navigateTo({ pathname: '/' })}
          />
        )
      case '/create-job':
        return (
          <CreateJob
            algorithms={this.state.algorithms.records}
            bbox={this.state.bbox}
            catalogApiKey={this.state.catalogApiKey}
            executorServiceId={this.state.executor.serviceId}
            sessionToken={this.state.sessionToken}
            filters={this.state.catalog.filters || []}
            isSearching={this.state.isSearching}
            searchError={this.state.searchError}
            searchCriteria={this.state.searchCriteria}
            selectedImage={this.state.selectedFeature && this.state.selectedFeature.properties[KEY_TYPE] === TYPE_SCENE ? this.state.selectedFeature : null}
            onCatalogApiKeyChange={this._handleCatalogApiKeyChange}
            onClearBbox={this._handleClearBbox}
            onJobCreated={this._handleJobCreated}
            onSearchCriteriaChange={this._handleSearchCriteriaChange}
            onSearchSubmit={this._handleSearchSubmit}
          />
        )
      case '/create-product-line':
        return (
          <CreateProductLine
            algorithms={this.state.algorithms.records}
            bbox={this.state.bbox}
            catalogApiKey={this.state.catalogApiKey}
            eventTypeId={this.state.catalogApiKey}
            executorServiceId={this.state.executor.serviceId}
            executorUrl={this.state.executor.url}
            filters={this.state.catalog.filters || []}
            sessionToken={this.state.sessionToken}
            onCatalogApiKeyChange={this._handleCatalogApiKeyChange}
            onClearBbox={this._handleClearBbox}
            onProductLineCreated={this._handleProductLineCreated}
          />
        )
      case '/help':
        return (
          <Help
            onDismiss={() => this.navigateTo({ pathname: '/' })}
          />
        )
      case '/jobs':
        return (
          <JobStatusList
            authToken={this.state.sessionToken}
            activeIds={this._detections.map(d => d.id)}
            error={this.state.jobs.error}
            jobs={this.state.jobs.records}
            onDismissError={this._handleDismissJobError}
            onForgetJob={this._handleForgetJob}
            onNavigateToJob={this.navigateTo}
          />
        )
      case '/product-lines':
        return (
          <ProductLineList
            error={this.state.productLines.error}
            isFetching={this.state.productLines.fetching}
            productLines={this.state.productLines.records}
            sessionToken={this.state.sessionToken}
            onFetch={this._handleFetchProductLines}
            onFetchJobs={this._handleFetchProductLineJobs}
            onJobHoverIn={this._handleProductLineJobHoverIn}
            onJobHoverOut={this._handleProductLineJobHoverOut}
            onJobSelect={this._handleProductLineJobSelect}
            onJobDeselect={this._handleProductLineJobDeselect}
          />
        )
      default:
        return (
          <div className={styles.unknownRoute}>
            wat
          </div>
        )
    }
  }

  //
  // Internals
  //

  get _detections() {
    switch (this.state.route.pathname) {
      case '/create-product-line':
      case '/product-lines':
        return this.state.selectedFeature ? [this.state.selectedFeature] : this.state.productLines.records
      default:
        return this.state.jobs.records.filter(j => this.state.route.jobIds.includes(j.id) && j.properties[KEY_STATUS] === STATUS_SUCCESS)
    }
  }

  get _frames() {
    switch (this.state.route.pathname) {
      case '/create-product-line':
      case '/product-lines':
        return [this.state.selectedFeature, ...this.state.productLines.records].filter(Boolean)
      default:
        return this.state.jobs.records
    }
  }

  get _mapMode() {
    switch (this.state.route.pathname) {
      case '/create-job': return (this.state.bbox && this.state.searchResults) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
      case '/create-product-line': return MODE_DRAW_BBOX
      case '/product-lines': return MODE_PRODUCT_LINES
      default: return MODE_NORMAL
    }
  }

  _autodiscoverServices() {
    this._autodiscoveryPromise = Promise.all([
      this._discoverAlgorithms(),
      this._discoverCatalog(),
      this._discoverExecutor(),
      this._discoverGeoserver(),
    ])
  }

  _discoverAlgorithms() {
    this.setState({
      algorithms: this.state.algorithms.$fetching(),
    })
    return algorithmsService.discover(this.state.sessionToken)
      .then(algorithms => {
        this.setState({
          algorithms: this.state.algorithms.$records(algorithms)
        })
      })
      .catch(err => {
        this.setState({
          algorithms: this.state.algorithms.$error(err)
        })
      })
  }

  _discoverCatalog() {
    this.setState({ catalog: { discovering: true } })
    return catalogService.discover(this.state.sessionToken)
      .then(catalog => this.setState({ catalog }))
      .catch(error => this.setState({ catalog: { error }}))
  }

  _discoverExecutor() {
    this.setState({ executor: { discovering: true }})
    executorService.discover(this.state.sessionToken)
      .then(executor => this.setState({ executor }))
      .catch(error => this.setState({ executor: { error }}))
  }

  _discoverGeoserver() {
    this.setState({ geoserver: { discovering: true }})
    return geoserverService.discover(this.state.sessionToken)
      .then(geoserver => this.setState({ geoserver }))
      .catch(error => this.setState({ geoserver: { error }}))
  }

  _handleBoundingBoxChange(bbox) {
    this.setState({ bbox })
  }

  _handleCatalogApiKeyChange(catalogApiKey) {
    this.setState({ catalogApiKey })
  }

  _handleClearBbox() {
    this.setState({ bbox: null })
  }

  _handleDismissJobError() {
    this.setState({
      jobs: this.state.jobs.$error(null),
    })
  }

  _handleFetchProductLines() {
    this._autodiscoveryPromise.then(() => {
      this.setState({
        productLines: this.state.productLines.$error(null).$fetching(),
      })
      productLinesService.fetchProductLines({
        algorithms:   this.state.algorithms.records,
        eventTypeId:  this.state.catalog.eventTypeId,
        executorUrl:  this.state.executor.url,
        filters:      this.state.catalog.filters,
        serviceId:    this.state.executor.serviceId,
        sessionToken: this.state.sessionToken,
      })
        .then(records => {
          this.setState({
            productLines: this.state.productLines.$records(records),
          })
        })
    })
  }

  _handleFetchProductLineJobs(productLineId, sinceDate) {
    return productLinesService.fetchJobs({
      productLineId,
      sinceDate,
      algorithms:   this.state.algorithms.records,
      executorUrl:  this.state.executor.url,
      sessionToken: this.state.sessionToken,
    })
  }

  _handleForgetJob(id) {
    this.setState({
      jobs: this.state.jobs.$filter(j => j.id !== id),
    })
    if (this.state.route.jobIds.includes(id)) {
      this.navigateTo({
        pathname: this.state.route.pathname,
        search: this.state.route.search.replace(new RegExp('\\??jobId=' + id), ''),
      })
    }
  }

  _handleJobCreated(job) {
    this.setState({
      jobs: this.state.jobs.$append(job)
    })
    this.navigateTo({
      pathname: '/jobs',
      search: '?jobId=' + job.id,
    })
  }

  _handleProductLineCreated() {
    this.navigateTo({ pathname: '/product-lines' })
  }

  _handleProductLineJobHoverIn(job) {
    this.setState({ hoveredFeature: job })
  }

  _handleProductLineJobHoverOut() {
    this.setState({ hoveredFeature: null })
  }

  _handleProductLineJobSelect(job) {
    this.setState({ selectedFeature: job })
  }

  _handleProductLineJobDeselect() {
    this.setState({ selectedFeature: null })
  }

  _handleSearchCriteriaChange(searchCriteria) {
    this.setState({ searchCriteria })
  }

  _handleSearchSubmit({startIndex, count} = {}) {
    this.setState({
      isSearching: true,
      selectedFeature: null,
    })
    catalogService.search(Object.assign({
      count,
      startIndex,
      bbox: this.state.bbox,
      catalogUrl: this.state.catalog.url,
    }, this.state.searchCriteria))
      .then(searchResults => this.setState({ searchResults, isSearching: false }))
      .catch(searchError => this.setState({ searchError, isSearching: false }))
  }

  _handleSelectFeature(feature) {
    if (this.state.selectedFeature === feature) {
      return  // Nothing to do
    }
    this.setState({
      selectedFeature: feature || null,
    })
    this.navigateTo({
      pathname: this.state.route.pathname,
      search:   (feature && feature.properties[KEY_TYPE] === TYPE_JOB) ? `?jobId=${feature.id}` : '',
    })
  }

  navigateTo(loc) {
    const route = generateRoute(loc)
    history.pushState(null, null, route.href)

    let {selectedFeature} = this.state
    if (!route.jobIds.length && this.state.selectedFeature && this.state.selectedFeature.properties[KEY_TYPE] === TYPE_JOB) {
      selectedFeature = null
    }
    else if (route.jobIds.length) {
      selectedFeature = this.state.jobs.records.find(j => route.jobIds.includes(j.id))
    }

    this.setState({
      route,
      selectedFeature,
      bbox: this.state.route.pathname === route.pathname ? this.state.bbox : null,
      searchResults: this.state.route.pathname === route.pathname ? this.state.searchResults : null,
    })
  }

  _startJobsWorker() {
    this._autodiscoveryPromise.then(() => {
      jobsService.startWorker({
        sessionToken: this.state.sessionToken,
        getRecords: () => this.state.jobs.records,
        onUpdate: (updatedRecord) => this.setState({
          jobs: this.state.jobs.$map(j => j.id === updatedRecord.id ? updatedRecord : j),
        }),
        onError: (err) => this.setState({
          jobs: this.state.jobs.$error(err),
        }),
        onTerminate() {}
      })
    })
  }

  _subscribeToHistoryEvents() {
    window.addEventListener('popstate', () => {
      if (this.state.route.href !== location.pathname + location.search + location.hash) {
        const route = generateRoute(location)
        this.setState({
          route,
          selectedFeature: route.jobIds.length ? this.state.jobs.records.find(j => route.jobIds.includes(j.id)) : this.state.selectedFeature,
        })
      }
    })
  }
}

Application.propTypes = {
  deserialize: React.PropTypes.func,
  serialize: React.PropTypes.func,
}

//
// Helpers
//

function generateInitialState() {
  const state = {
    sessionToken: null,
    route: generateRoute(location),

    // Services
    catalog: {},
    executor: {},
    geoserver: {},

    // Data Collections
    algorithms: createCollection(),
    jobs: createCollection(),
    productLines: createCollection(),

    // Map state
    bbox: null,
    mapView: null,
    selectedFeature: null,

    // Search state
    isSearching: false,
    searchCriteria: createSearchCriteria(),
    searchError: null,
    searchResults: null,
  }

  const deserializedState = deserialize()
  for (const key in deserializedState) {
    state[key] = deserializedState[key] || state[key]
  }

  return state
}

function deserialize() {
  return {
    algorithms:     createCollection(JSON.parse(sessionStorage.getItem('algorithms_records')) || []),
    bbox:           JSON.parse(sessionStorage.getItem('bbox')),
    catalog:        JSON.parse(sessionStorage.getItem('catalog')),
    executor:       JSON.parse(sessionStorage.getItem('executor')),
    geoserver:      JSON.parse(sessionStorage.getItem('geoserver')),
    jobs:           createCollection(JSON.parse(localStorage.getItem('jobs_records')) || []),
    mapView:        JSON.parse(sessionStorage.getItem('mapView')),
    searchCriteria: JSON.parse(sessionStorage.getItem('searchCriteria')),
    searchResults:  JSON.parse(sessionStorage.getItem('searchResults')),
    selectedFeature: JSON.parse(sessionStorage.getItem('selectedFeature')),
    sessionToken:   sessionStorage.getItem('sessionToken') || null,
    catalogApiKey:  localStorage.getItem('catalog_apiKey') || '',  // HACK
  }
}

function serialize(state) {
  console.groupCollapsed('(Application:serialize)')
  console.debug(JSON.stringify(state, null, 2))
  console.groupEnd()
  sessionStorage.setItem('algorithms_records', JSON.stringify(state.algorithms.records))
  sessionStorage.setItem('bbox', JSON.stringify(state.bbox))
  sessionStorage.setItem('catalog', JSON.stringify(state.catalog))
  sessionStorage.setItem('executor', JSON.stringify(state.executor))
  sessionStorage.setItem('geoserver', JSON.stringify(state.geoserver))
  localStorage.setItem('jobs_records', JSON.stringify(state.jobs.records))
  sessionStorage.setItem('mapView', JSON.stringify(state.mapView))
  sessionStorage.setItem('searchCriteria', JSON.stringify(state.searchCriteria))
  sessionStorage.setItem('searchResults', JSON.stringify(state.searchResults))
  sessionStorage.setItem('selectedFeature', JSON.stringify(state.selectedFeature))
  sessionStorage.setItem('sessionToken', state.sessionToken || '')
  localStorage.setItem('catalog_apiKey', state.catalogApiKey)  // HACK
}

function generateRoute({ pathname = '/', search = '', hash = '' }) {
  return {
    pathname,
    search,
    hash,

    // Helpers
    href: pathname + search + hash,
    jobIds: search.substr(1).split('&').filter(s => s.startsWith('jobId')).map(s => s.replace('jobId=', '')),
  }
}

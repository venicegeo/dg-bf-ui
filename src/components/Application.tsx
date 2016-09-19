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

import * as React from 'react'
import {render} from 'react-dom'
import debounce = require('lodash/debounce')
import {About} from './About'
import {CreateJob, SearchCriteria, createSearchCriteria} from './CreateJob'
import {CreateProductLine} from './CreateProductLine'
import {Help} from './Help'
import {JobStatusList} from './JobStatusList'
import {Login} from './Login'
import {Navigation} from './Navigation'
import {
  PrimaryMap,
  MapView,
  MODE_DRAW_BBOX,
  MODE_NORMAL,
  MODE_SELECT_IMAGERY,
  MODE_PRODUCT_LINES,
} from './PrimaryMap'
import {ProductLineList} from './ProductLineList'
import {SessionExpired} from './SessionExpired'
import {UpdateAvailable} from './UpdateAvailable'
import * as algorithmsService from '../api/algorithms'
import * as jobsService from '../api/jobs'
import * as catalogService from '../api/catalog'
import * as executorService from '../api/executor'
import * as geoserverService from '../api/geoserver'
import * as productLinesService from '../api/productLines'
import * as sessionService from '../api/session'
import * as updateService from '../api/update'
import {createCollection, Collection} from '../utils/collections'
import {getFeatureCenter} from '../utils/geometries'
import {upgradeIfNeeded} from '../utils/upgrade-job-record'

import {
  STATUS_SUCCESS,
  TYPE_JOB,
  TYPE_SCENE,
} from '../constants'

interface Props {
  serialize(state: State)
  deserialize(): State
}

interface State {
  catalogApiKey?: string
  error?: any
  isLoggedIn?: boolean
  isSessionExpired?: boolean
  isUpdateAvailable?: boolean
  route?: Route

  // Services
  catalog?: catalogService.ServiceDescriptor
  executor?: executorService.ServiceDescriptor
  geoserver?: geoserverService.ServiceDescriptor

  // Data Collections
  algorithms?: Collection<beachfront.Algorithm>
  jobs?: Collection<beachfront.Job>
  productLines?: Collection<beachfront.ProductLine>

  // Map state
  bbox?: number[]
  mapView?: MapView
  hoveredFeature?: beachfront.Job
  selectedFeature?: beachfront.Job | beachfront.Scene

  // Search state
  isSearching?: boolean
  searchCriteria?: SearchCriteria
  searchError?: any
  searchResults?: beachfront.ImageryCatalogPage
}

export const createApplication = (element) => render(
  <Application
    deserialize={generateInitialState}
    serialize={debounce(serialize, 500)}
  />, element)

export class Application extends React.Component<Props, State> {
  private autodiscoveryPromise: Promise<any>

  constructor(props) {
    super(props)
    this.state = props.deserialize()
    this.handleBoundingBoxChange = this.handleBoundingBoxChange.bind(this)
    this.handleCatalogApiKeyChange = this.handleCatalogApiKeyChange.bind(this)
    this.handleClearBbox = this.handleClearBbox.bind(this)
    this.handleDismissJobError = this.handleDismissJobError.bind(this)
    this.handleFetchProductLines = this.handleFetchProductLines.bind(this)
    this.handleFetchProductLineJobs = this.handleFetchProductLineJobs.bind(this)
    this.handleForgetJob = this.handleForgetJob.bind(this)
    this.handleJobCreated = this.handleJobCreated.bind(this)
    this.handleNavigateToJob = this.handleNavigateToJob.bind(this)
    this.handlePanToProductLine = this.handlePanToProductLine.bind(this)
    this.handleProductLineCreated = this.handleProductLineCreated.bind(this)
    this.handleProductLineJobHoverIn = this.handleProductLineJobHoverIn.bind(this)
    this.handleProductLineJobHoverOut = this.handleProductLineJobHoverOut.bind(this)
    this.handleProductLineJobSelect = this.handleProductLineJobSelect.bind(this)
    this.handleProductLineJobDeselect = this.handleProductLineJobDeselect.bind(this)
    this.handleSearchCriteriaChange = this.handleSearchCriteriaChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
    this.handleSelectFeature = this.handleSelectFeature.bind(this)
    this.navigateTo = this.navigateTo.bind(this)
    this.panTo = this.panTo.bind(this)
  }

  componentDidUpdate(_, prevState: State) {
    if (!prevState.isLoggedIn && this.state.isLoggedIn) {
      this.autodiscoverServices()
      this.startWorkers()
    }
    if (!prevState.isSessionExpired && this.state.isSessionExpired || prevState.isLoggedIn && !this.state.isLoggedIn) {
      this.stopWorkers()
    }
    this.props.serialize(this.state)
  }

  componentWillMount() {
    this.subscribeToHistoryEvents()
    if (this.state.isLoggedIn && !this.state.isSessionExpired) {
      this.autodiscoverServices()
      this.startWorkers()
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
          bbox={this.state.bbox}
          catalogApiKey={this.state.catalogApiKey}
          detections={this.detectionsForCurrentMode}
          frames={this.framesForCurrentMode}
          geoserverUrl={this.state.geoserver.url}
          highlightedFeature={this.state.hoveredFeature}
          imagery={this.state.searchResults}
          isSearching={this.state.isSearching}
          mode={this.mapMode}
          selectedFeature={this.state.selectedFeature}
          view={this.state.mapView}
          onBoundingBoxChange={this.handleBoundingBoxChange}
          onSearchPageChange={this.handleSearchSubmit}
          onSelectFeature={this.handleSelectFeature}
          onViewChange={mapView => this.setState({ mapView })}
        />
        {this.renderRoute()}
        {this.state.isSessionExpired && (
          <SessionExpired
            onDismiss={() => {
              sessionStorage.clear()
              this.setState({
                isLoggedIn: false,
                isSessionExpired: false,
              })
            }}
          />
        )}
        {this.state.isUpdateAvailable && (
          <UpdateAvailable
            onDismiss={() => {
              this.setState({
                isUpdateAvailable: false,
              })
            }}
          />
        )}
      </div>
    )
  }

  renderRoute() {
    if (!this.state.isLoggedIn) {
      return (
        <Login
          onSuccess={() => this.setState({ isLoggedIn: true })}
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
            filters={this.state.catalog.filters || []}
            isSearching={this.state.isSearching}
            searchError={this.state.searchError}
            searchCriteria={this.state.searchCriteria}
            selectedScene={this.state.selectedFeature && this.state.selectedFeature.properties.type === TYPE_SCENE ? this.state.selectedFeature as beachfront.Scene : null}
            onCatalogApiKeyChange={this.handleCatalogApiKeyChange}
            onClearBbox={this.handleClearBbox}
            onJobCreated={this.handleJobCreated}
            onSearchCriteriaChange={this.handleSearchCriteriaChange}
            onSearchSubmit={this.handleSearchSubmit}
          />
        )
      case '/create-product-line':
        return (
          <CreateProductLine
            algorithms={this.state.algorithms.records}
            bbox={this.state.bbox}
            catalogApiKey={this.state.catalogApiKey}
            eventTypeId={this.state.catalog.eventTypeId}
            executorServiceId={this.state.executor.serviceId}
            executorUrl={this.state.executor.url}
            filters={this.state.catalog.filters || []}
            onCatalogApiKeyChange={this.handleCatalogApiKeyChange}
            onClearBbox={this.handleClearBbox}
            onProductLineCreated={this.handleProductLineCreated}
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
            activeIds={this.detectionsForCurrentMode.map(d => d.id)}
            error={this.state.jobs.error}
            jobs={this.state.jobs.records}
            onDismissError={this.handleDismissJobError}
            onForgetJob={this.handleForgetJob}
            onNavigateToJob={this.handleNavigateToJob}
          />
        )
      case '/product-lines':
        return (
          <ProductLineList
            error={this.state.productLines.error}
            isFetching={this.state.productLines.fetching}
            productLines={this.state.productLines.records}
            onFetch={this.handleFetchProductLines}
            onFetchJobs={this.handleFetchProductLineJobs}
            onJobHoverIn={this.handleProductLineJobHoverIn}
            onJobHoverOut={this.handleProductLineJobHoverOut}
            onJobSelect={this.handleProductLineJobSelect}
            onJobDeselect={this.handleProductLineJobDeselect}
            onPanTo={this.handlePanToProductLine}
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

  private get detectionsForCurrentMode(): (beachfront.Job|beachfront.ProductLine)[] {
    switch (this.state.route.pathname) {
      case '/create-product-line':
      case '/product-lines':
        return this.state.selectedFeature ? [this.state.selectedFeature as any] : this.state.productLines.records
      default:
        return this.state.jobs.records.filter(j => this.state.route.jobIds.includes(j.id) && j.properties.status === STATUS_SUCCESS)
    }
  }

  private get framesForCurrentMode(): (beachfront.Job | beachfront.ProductLine)[] {
    switch (this.state.route.pathname) {
      case '/create-product-line':
      case '/product-lines':
        return [this.state.selectedFeature as any, ...this.state.productLines.records].filter(Boolean)
      default:
        return this.state.jobs.records
    }
  }

  private get mapMode() {
    switch (this.state.route.pathname) {
      case '/create-job': return (this.state.bbox && this.state.searchResults) ? MODE_SELECT_IMAGERY : MODE_DRAW_BBOX
      case '/create-product-line': return MODE_DRAW_BBOX
      case '/product-lines': return MODE_PRODUCT_LINES
      default: return MODE_NORMAL
    }
  }

  private autodiscoverServices() {
    this.autodiscoveryPromise = Promise.all([
      this.discoverAlgorithms(),
      this.discoverCatalog(),
      this.discoverExecutor(),
      this.discoverGeoserver(),
    ])
  }

  private discoverAlgorithms() {
    this.setState({
      algorithms: this.state.algorithms.$fetching(),
    })
    return algorithmsService.discover()
      .then(algorithms => {
        this.setState({
          algorithms: this.state.algorithms.$records(algorithms),
        })
      })
      .catch(err => {
        this.setState({
          algorithms: this.state.algorithms.$error(err),
        })
      })
  }

  private discoverCatalog() {
    return catalogService.discover()
      .then(catalog => this.setState({ catalog }))
      .catch(error => this.setState({ catalog: { error }}))
  }

  private discoverExecutor() {
    return executorService.discover()
      .then(executor => this.setState({ executor }))
      .catch(error => this.setState({ executor: { error }}))
  }

  private discoverGeoserver() {
    return geoserverService.discover()
      .then(geoserver => this.setState({ geoserver }))
      .catch(error => this.setState({ geoserver: { error }}))
  }

  private handleBoundingBoxChange(bbox) {
    this.setState({ bbox })
  }

  private handleCatalogApiKeyChange(catalogApiKey) {
    this.setState({ catalogApiKey })
  }

  private handleClearBbox() {
    this.setState({
      bbox: null,
      searchResults: null,
      selectedFeature: null,
    })
  }

  private handleDismissJobError() {
    this.setState({
      jobs: this.state.jobs.$error(null),
    })
  }

  private handleFetchProductLines() {
    this.autodiscoveryPromise.then(() => {
      this.setState({
        productLines: this.state.productLines.$error(null).$fetching(),
      })
      productLinesService.fetchProductLines({
        algorithms:   this.state.algorithms.records,
        eventTypeId:  this.state.catalog.eventTypeId,
        executorUrl:  this.state.executor.url,
        filters:      this.state.catalog.filters,
        serviceId:    this.state.executor.serviceId,
      })
        .then(records => {
          this.setState({
            productLines: this.state.productLines.$records(records),
          })
        })
    })
  }

  private handleFetchProductLineJobs(productLineId, sinceDate) {
    return productLinesService.fetchJobs({
      productLineId,
      sinceDate,
      algorithms:   this.state.algorithms.records,
      executorUrl:  this.state.executor.url,
    })
  }

  private handleForgetJob(id) {
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

  private handleJobCreated(job) {
    this.setState({
      jobs: this.state.jobs.$append(job),
    })
    this.navigateTo({
      pathname: '/jobs',
      search: '?jobId=' + job.id,
    })
  }

  private handleNavigateToJob(loc) {
    this.navigateTo(loc)
    this.panTo(getFeatureCenter(this.state.jobs.records.find(j => loc.search.includes(j.id))), 7.5)
  }

  private handlePanToProductLine(productLine) {
    this.panTo(getFeatureCenter(productLine), 3.5)
  }

  private handleProductLineCreated() {
    this.navigateTo({ pathname: '/product-lines' })
  }

  private handleProductLineJobHoverIn(job) {
    this.setState({ hoveredFeature: job })
  }

  private handleProductLineJobHoverOut() {
    this.setState({ hoveredFeature: null })
  }

  private handleProductLineJobSelect(job) {
    this.setState({ selectedFeature: job })
  }

  private handleProductLineJobDeselect() {
    this.setState({ selectedFeature: null })
  }

  private handleSearchCriteriaChange(searchCriteria) {
    this.setState({ searchCriteria })
  }

  private handleSearchSubmit({startIndex = 0, count = 100} = {}) {
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

  private handleSelectFeature(feature) {
    if (this.state.selectedFeature === feature) {
      return  // Nothing to do
    }
    this.setState({
      selectedFeature: feature || null,
    })
    this.navigateTo({
      pathname: this.state.route.pathname,
      search:   (feature && feature.properties.type === TYPE_JOB) ? `?jobId=${feature.id}` : '',
    })
  }

  private navigateTo(loc) {
    const route = generateRoute(loc)
    history.pushState(null, null, route.href)

    // Update selected feature if needed
    let {selectedFeature} = this.state
    if (route.jobIds.length) {
      selectedFeature = this.state.jobs.records.find(j => route.jobIds.includes(j.id))
    }
    if (!route.jobIds.length && selectedFeature && selectedFeature.properties.type === TYPE_JOB) {
      selectedFeature = null
    }
    else if (route.pathname !== this.state.route.pathname && selectedFeature && selectedFeature.properties.type === TYPE_SCENE) {
      selectedFeature = null
    }

    this.setState({
      route,
      selectedFeature,
      bbox: this.state.route.pathname === route.pathname ? this.state.bbox : null,
      searchResults: this.state.route.pathname === route.pathname ? this.state.searchResults : null,
    })
  }

  private panTo(point, zoom = 10) {
    this.setState({
      mapView: Object.assign({}, this.state.mapView, {
        center: point,
        zoom,
      }),
    })
  }

  private startWorkers() {
    jobsService.startWorker({
      getRecords: () => this.state.jobs.records,
      onUpdate: (updatedRecord) => this.setState({
        jobs: this.state.jobs.$map(j => j.id === updatedRecord.id ? updatedRecord : j),
      }),
      onError: (err) => this.setState({
        jobs: this.state.jobs.$error(err),
      }),
      onTerminate() {/* noop */},
    })

    sessionService.startWorker({
      onExpired: () => this.setState({ isSessionExpired: true }),
    })

    updateService.startWorker({
      onAvailable: () => this.setState({ isUpdateAvailable: true }),
    })
  }

  private stopWorkers() {
    jobsService.stopWorker()
    sessionService.stopWorker()
    updateService.stopWorker()
  }

  private subscribeToHistoryEvents() {
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

//
// Helpers
//

function generateInitialState(): State {
  const state: State = {
    catalogApiKey: '',
    route: generateRoute(location),
    isLoggedIn: sessionService.exists(),
    isSessionExpired: false,
    isUpdateAvailable: false,

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

function deserialize(): State {
  return {
    algorithms:       createCollection(JSON.parse(sessionStorage.getItem('algorithms_records')) || []),
    bbox:             JSON.parse(sessionStorage.getItem('bbox')),
    catalog:          JSON.parse(sessionStorage.getItem('catalog')),
    executor:         JSON.parse(sessionStorage.getItem('executor')),
    geoserver:        JSON.parse(sessionStorage.getItem('geoserver')),
    isSessionExpired: JSON.parse(sessionStorage.getItem('isSessionExpired')),
    jobs:             createCollection((JSON.parse(localStorage.getItem('jobs_records')) || []).map(upgradeIfNeeded).filter(Boolean)),
    mapView:          JSON.parse(sessionStorage.getItem('mapView')),
    searchCriteria:   JSON.parse(sessionStorage.getItem('searchCriteria')),
    searchResults:    JSON.parse(sessionStorage.getItem('searchResults')),
    catalogApiKey:    localStorage.getItem('catalog_apiKey') || '',  // HACK
  }
}

function serialize(state: State) {
  sessionStorage.setItem('algorithms_records', JSON.stringify(state.algorithms.records))
  sessionStorage.setItem('bbox', JSON.stringify(state.bbox))
  sessionStorage.setItem('catalog', JSON.stringify(state.catalog))
  sessionStorage.setItem('executor', JSON.stringify(state.executor))
  sessionStorage.setItem('geoserver', JSON.stringify(state.geoserver))
  sessionStorage.setItem('isSessionExpired', JSON.stringify(state.isSessionExpired))
  localStorage.setItem('jobs_records', JSON.stringify(state.jobs.records))
  sessionStorage.setItem('mapView', JSON.stringify(state.mapView))
  sessionStorage.setItem('searchCriteria', JSON.stringify(state.searchCriteria))
  sessionStorage.setItem('searchResults', JSON.stringify(state.searchResults))
  localStorage.setItem('catalog_apiKey', state.catalogApiKey)  // HACK
}

interface Route {
  hash: string
  href: string
  jobIds: string[]
  pathname: string
  search: string
}

function generateRoute({ pathname = '/', search = '', hash = '' }): Route {
  return {
    pathname,
    search,
    hash,

    // Helpers
    href: pathname + search + hash,
    jobIds: search.substr(1).split('&').filter(s => s.startsWith('jobId')).map(s => s.replace('jobId=', '')),
  }
}

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

const styles: any = require('./Application.css')

import * as React from 'react'
import {render} from 'react-dom'
import * as debounce from 'lodash/debounce'
import {About} from './About'
import {CreateJob, SearchCriteria, createSearchCriteria} from './CreateJob'
import {CreateProductLine} from './CreateProductLine'
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
import {SessionLoggedOut} from './SessionLoggedOut'
import {UpdateAvailable} from './UpdateAvailable'
import * as algorithmsService from '../api/algorithms'
import * as catalogService from '../api/catalog'
import * as geoserverService from '../api/geoserver'
import * as jobsService from '../api/jobs'
import * as productLinesService from '../api/productLines'
import * as sessionService from '../api/session'
import * as updateService from '../api/update'
import {createCollection, Collection} from '../utils/collections'
import {getFeatureCenter} from '../utils/geometries'
import {RECORD_POLLING_INTERVAL} from '../config'

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
  errors?: any[]
  isLoggedIn?: boolean
  isSessionLoggedOut?: boolean
  isSessionExpired?: boolean
  isUpdateAvailable?: boolean
  route?: Route

  // Services
  geoserver?: geoserverService.Descriptor

  // Data Collections
  algorithms?: Collection<beachfront.Algorithm>
  jobs?: Collection<beachfront.Job>
  productLines?: Collection<beachfront.ProductLine>

  // Map state
  bbox?: [number, number, number, number]
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
  private initializationPromise: Promise<any>
  private pollingInstance: number

  constructor(props) {
    super(props)
    this.state = props.deserialize()
    this.handleBoundingBoxChange = this.handleBoundingBoxChange.bind(this)
    this.handleCatalogApiKeyChange = this.handleCatalogApiKeyChange.bind(this)
    this.handleClearBbox = this.handleClearBbox.bind(this)
    this.handleDismissJobError = this.handleDismissJobError.bind(this)
    this.handleDismissProductLineError = this.handleDismissProductLineError.bind(this)
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
    this.logout = this.logout.bind(this)
  }

  componentDidUpdate(_, prevState: State) {
    if (!prevState.isLoggedIn && this.state.isLoggedIn) {
      this.initializeServices()
      this.startBackgroundTasks()
      this.refreshRecords()
    }
    if (!prevState.isSessionExpired && this.state.isSessionExpired || prevState.isLoggedIn && !this.state.isLoggedIn) {
      this.stopBackgroundTasks()
    }
    if (prevState.route.jobIds.join(',') !== this.state.route.jobIds.join(',')) {
      this.importJobsIfNeeded()
    }
    this.props.serialize(this.state)
  }

  componentWillMount() {
    this.subscribeToHistoryEvents()
    if (this.state.isLoggedIn && !this.state.isSessionExpired) {
      this.initializeServices()
      this.startBackgroundTasks()
      this.refreshRecords()
          .then(this.importJobsIfNeeded.bind(this))
    }
  }

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.logout}><a href={sessionService.LOGOUT_URL} onClick={this.logout}>Log Out</a></div>
        <Navigation
          activeRoute={this.state.route}
          onClick={this.navigateTo}
        />
        <PrimaryMap
          bbox={this.state.bbox}
          catalogApiKey={this.state.catalogApiKey}
          detections={this.detectionsForCurrentMode}
          frames={this.framesForCurrentMode}
          highlightedFeature={this.state.hoveredFeature}
          imagery={this.state.searchResults}
          isSearching={this.state.isSearching}
          mode={this.mapMode}
          selectedFeature={this.state.selectedFeature}
          view={this.state.mapView}
          wmsUrl={this.state.geoserver.wmsUrl}
          shrunk={this.state.route.pathname !== '/'}
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
        {this.state.isSessionLoggedOut && (
          <SessionLoggedOut
            onDismiss={() => {
              this.setState({
                isLoggedIn: false,
                isSessionLoggedOut: false,
              })
            }}
            onInitialize={() => {
              sessionStorage.clear()
              const client = sessionService.getClient()
              client.get(`/logout`)
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
        <Login/>
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
            onCatalogApiKeyChange={this.handleCatalogApiKeyChange}
            onClearBbox={this.handleClearBbox}
            onProductLineCreated={this.handleProductLineCreated}
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
            onDismissError={this.handleDismissProductLineError}
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

  private importJobsIfNeeded() {
    this.state.route.jobIds.map(jobId => {
      if (this.state.jobs.records.find(j => j.id === jobId)) {
        return
      }
      console.debug('(application:componentDidUpdate) fetching job %s', jobId)
      jobsService.fetchJob(jobId)
        .then(record => {
          this.setState({ jobs: this.state.jobs.$append(record) })
          this.panTo(getFeatureCenter(record))
        })
        .catch(err => {
          console.error('(application:fetch) failed:', err)
          throw err
        })
    })
  }

  private initializeServices() {
    this.initializationPromise = Promise.all([
      this.fetchAlgorithms(),
      this.fetchGeoserverConfig(),
      this.initializeCatalog(),
    ])
  }

  private fetchAlgorithms() {
    this.setState({ algorithms: this.state.algorithms.$fetching() })
    return algorithmsService.lookup()
      .then(algorithms => this.setState({ algorithms: this.state.algorithms.$records(algorithms) }))
      .catch(err => this.setState({ algorithms: this.state.algorithms.$error(err) }))
  }

  private fetchGeoserverConfig() {
    return geoserverService.lookup()
      .then(geoserver => this.setState({ geoserver }))
      .catch(err => this.setState({ errors: [...this.state.errors, err] }))
  }

  private fetchJobs() {
    this.setState({ jobs: this.state.jobs.$fetching() })
    return jobsService.fetchJobs()
      .then(jobs => this.setState({ jobs: this.state.jobs.$records(jobs) }))
      .catch(err => this.setState({ jobs: this.state.jobs.$error(err) }))
  }

  private fetchProductLines() {
    this.setState({ productLines: this.state.productLines.$fetching() })
    return productLinesService.fetchProductLines()
      .then(records => this.setState({ productLines: this.state.productLines.$records(records) }))
      .catch(err => this.setState({ productLines: this.state.productLines.$error(err) }))
  }

  private initializeCatalog() {
    return catalogService.initialize()
      .catch(err => this.setState({ errors: [...this.state.errors, err] }))
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
      searchError: null,
      selectedFeature: null,
    })
  }

  private handleDismissJobError() {
    this.setState({
      jobs: this.state.jobs.$error(null),
    })
    setTimeout(() => this.fetchJobs())
  }

  private handleDismissProductLineError() {
    this.setState({
      productLines: this.state.productLines.$error(null),
    })
    setTimeout(() => this.fetchProductLines())
  }

  private handleForgetJob(id) {
    const job = this.state.jobs.records.find(j => j.id === id)
    this.setState({
      jobs: this.state.jobs.$filter(j => j.id !== id),
    })
    if (this.state.route.jobIds.includes(id)) {
      this.navigateTo({
        pathname: this.state.route.pathname,
        search: this.state.route.search.replace(new RegExp('\\??jobId=' + id), ''),
      })
    }
    jobsService.forgetJob(id)
      .catch(() => {
        this.setState({
          jobs: this.state.jobs.$append(job),
        })
      })
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
    this.panTo(getFeatureCenter(this.state.jobs.records.find(j => loc.search.includes(j.id))))
  }

  private handlePanToProductLine(productLine) {
    this.panTo(getFeatureCenter(productLine), 3.5)
  }

  private handleProductLineCreated(productLine: beachfront.ProductLine) {
    this.setState({
      productLines: this.state.productLines.$append(productLine),
    })
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
    catalogService.search({
      count,
      startIndex,
      bbox: this.state.bbox,
      catalogApiKey: this.state.catalogApiKey,
      ...this.state.searchCriteria,
    })
      .then(searchResults => this.setState({ searchResults, searchError: null, isSearching: false }))
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
      searchError: this.state.route.pathname === route.pathname ? this.state.searchError : null,
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

  private refreshRecords() {
    console.debug('(application:refreshRecords) fetching latest jobs and product lines')
    return Promise.all([
      this.fetchJobs(),
      this.fetchProductLines(),
    ])
  }

  private logout() {
    sessionService.destroy()
  }

  private startBackgroundTasks() {
    sessionService.onExpired(() => this.setState({ isSessionExpired: true }))
    updateService.startWorker({
      onAvailable: () => this.setState({ isUpdateAvailable: true }),
    })

    console.debug('(application:startBackgroundTasks) starting job/productline polling at %s second intervals', Math.ceil(RECORD_POLLING_INTERVAL / 1000))
    this.pollingInstance = setInterval(this.refreshRecords.bind(this), RECORD_POLLING_INTERVAL)
  }

  private stopBackgroundTasks() {
    updateService.stopWorker()

    console.debug('(application:stopBackgroundTasks) stopping job/productline polling')
    clearInterval(this.pollingInstance)
  }

  private subscribeToHistoryEvents() {
    window.addEventListener('popstate', () => {
      if (this.state.route.href !== location.pathname + location.search + location.hash) {
        const route = generateRoute(location)
        const nextJobIds = route.jobIds.join(',')
        const prevJobIds = this.state.route.jobIds.join(',')
        const selectedFeature = prevJobIds !== nextJobIds ? this.state.jobs.records.find(j => route.jobIds.includes(j.id)) : this.state.selectedFeature
        this.setState({ route, selectedFeature })
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
    errors: [],
    route: generateRoute(location),
    isLoggedIn: sessionService.initialize(),
    isSessionExpired: false,
    isSessionLoggedOut: false,
    isUpdateAvailable: false,

    // Services
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

  const [jobId] = state.route.jobIds
  if (jobId) {
    state.selectedFeature = state.jobs.records.find(j => j.id === jobId) || null
  }

  return state
}

function deserialize(): State {
  return {
    algorithms:       createCollection(JSON.parse(sessionStorage.getItem('algorithms_records')) || []),
    bbox:             JSON.parse(sessionStorage.getItem('bbox')),
    geoserver:        JSON.parse(sessionStorage.getItem('geoserver')),
    isSessionExpired: JSON.parse(sessionStorage.getItem('isSessionExpired')),
    mapView:          JSON.parse(sessionStorage.getItem('mapView')),
    searchCriteria:   JSON.parse(sessionStorage.getItem('searchCriteria')),
    searchResults:    JSON.parse(sessionStorage.getItem('searchResults')),
    catalogApiKey:    localStorage.getItem('catalog_apiKey') || '',  // HACK
  }
}

function serialize(state: State) {
  sessionStorage.setItem('algorithms_records', JSON.stringify(state.algorithms.records))
  sessionStorage.setItem('bbox', JSON.stringify(state.bbox))
  sessionStorage.setItem('geoserver', JSON.stringify(state.geoserver))
  sessionStorage.setItem('isSessionExpired', JSON.stringify(state.isSessionExpired))
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

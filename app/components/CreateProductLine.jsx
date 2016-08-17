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

import React, {Component} from 'react'
import {connect} from 'react-redux'
import AlgorithmListProductLine from './AlgorithmListProductLine'
import ProductLineForm from './ProductLineForm'
import NewProductLineDetails from './NewProductLineDetails'
import ComputeMasking from './ComputeMasking'
import styles from './CreateProductLine.css'
import {
  createProductLine,
  changeProductLineName,
  resetProductLineName,
  searchCatalog,
  updateCatalogApiKey,
  updateSearchBbox,
  updateSearchCloudCover,
  updateSearchDates,
  updateSearchFilter,
} from '../actions'

export class CreateProductLine extends Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  static propTypes = {
    algorithms:               React.PropTypes.array.isRequired,
    bbox:                     React.PropTypes.arrayOf(React.PropTypes.number),
    catalogApiKey:            React.PropTypes.string,
    cloudCover:               React.PropTypes.number.isRequired,
    filter:                   React.PropTypes.string,
    filters:                  React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    isCreating:               React.PropTypes.bool.isRequired,
    isSearching:              React.PropTypes.bool.isRequired,
    productLineName:          React.PropTypes.string.isRequired,
    onCatalogApiKeyChange:    React.PropTypes.func.isRequired,
    onClearBbox:              React.PropTypes.func.isRequired,
    onProductLineSubmit:              React.PropTypes.func.isRequired,
    onNameChange:             React.PropTypes.func.isRequired,
    onResetName:              React.PropTypes.func.isRequired,
    onSearchCloudCoverChange: React.PropTypes.func.isRequired,
    onSearchFilterChange:     React.PropTypes.func.isRequired,
    onSearchDateChange:       React.PropTypes.func.isRequired,
    onSearchSubmit:           React.PropTypes.func.isRequired
  }

  constructor() {
    super()
    this._emitProductLineSubmit = this._emitProductLineSubmit.bind(this)
  }

  componentDidMount() {
    this.props.onResetName()
  }

  render() {
    return (
      <div className={styles.root}>
        <header>
          <h1>Create Product Line</h1>
        </header>
        <ul>
          {this.props.bbox && ([
            <li className={styles.search}>
              <ProductLineForm
                bbox={this.props.bbox}
                catalogApiKey={this.props.catalogApiKey}
                cloudCover={this.props.cloudCover}
                filter={this.props.filter}
                filters={this.props.filters}
                isSearching={this.props.isSearching}
                onApiKeyChange={this.props.onCatalogApiKeyChange}
                onClearBbox={this.props.onClearBbox}
                onCloudCoverChange={this.props.onSearchCloudCoverChange}
                onDateChange={this.props.onSearchDateChange}
                onFilterChange={this.props.onSearchFilterChange}
                onSubmit={this.props.onSearchSubmit}
              />
            </li>,
            <li className={styles.details}>
              <NewProductLineDetails
                name={this.props.productLineName}
                onNameChange={this.props.onNameChange}
              />
            </li>,
            <li className={styles.details}>
              <ComputeMasking/>
            </li>,
            <li className={styles.algorithms}>
              <AlgorithmListProductLine
                algorithms={this.props.algorithms}
                isSubmitting={this.props.isCreating}
                onSubmit={this._emitProductLineSubmit}
              />
            </li>
          ])}
          {!this.props.bbox && (
            <li className={styles.placeholder}>
              <h3>Draw bounding box to set AOI</h3>
            </li>
          )}
        </ul>
      </div>
    )
  }

  _emitProductLineSubmit(algorithm) {
    const {productLineName, catalogApiKey} = this.props
    this.props.onProductLineSubmit(catalogApiKey, productLineName, algorithm)
      .then(productLineId => {
        this.context.router.push({
          pathname: '/product-lines',
          query: {
            productLineId
          }
        })
      })
  }
}

export default connect(state => ({
  algorithms:      state.algorithms.records,
  bbox:            state.search.bbox,
  catalogApiKey:   state.catalog.apiKey,
  cloudCover:      state.search.cloudCover,
  dateToBegin:     state.search.dateToBegin,
  dateToEnd:       state.search.dateToEnd,
  filter:          state.search.filter,
  filters:         state.catalog.filters,
  isCreating:      state.jobs.creating,
  isSearching:     state.search.searching,
  productLineName: state.draftProductLine.name,
}), dispatch => ({
  onProductLineSubmit:      (apiKey, name, algorithm) => dispatch(createProductLine(apiKey, name, algorithm)),
  onCatalogApiKeyChange:    (apiKey) => dispatch(updateCatalogApiKey(apiKey)),
  onClearBbox:              () => dispatch(updateSearchBbox()),
  onNameChange:             (name) => dispatch(changeProductLineName(name)),
  onResetName:              () => dispatch(resetProductLineName()),
  onSearchCloudCoverChange: (cloudCover) => dispatch(updateSearchCloudCover(cloudCover)),
  onSearchFilterChange:     (filter) => dispatch(updateSearchFilter(filter)),
  onSearchDateChange:       (dateFrom, dateTo) => dispatch(updateSearchDates(dateFrom, dateTo)),
  onSearchSubmit:           () => dispatch(searchCatalog()),
}))(CreateProductLine)

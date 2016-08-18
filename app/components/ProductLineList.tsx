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

const styles = require('./ProductLineList.css')

import * as React from 'react'
import {connect} from 'react-redux'
import ProductLine from './ProductLine'
import {
  clearHoveredProductLineJob,
  clearSelectedProductLineJob,
  fetchProductLines,
  fetchProductLineJobs,
  hoverProductLineJob,
  selectProductLineJob,
} from '../actions'

interface Props {
  isFetching:        boolean
  jobs:              beachfront.Job[]
  productLines:      beachfront.Job[]  // FIXME
  selectedJobIds:    string[]
  fetchProductLines()
  onFetchJobs(productLineId: string, sinceDate: string)
  onJobHoverIn(job: beachfront.Job)
  onJobHoverOut(job: beachfront.Job)
  onJobSelect(job: beachfront.Job)
  onJobDeselect()
}

export class ProductLineList extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.fetchProductLines()
  }

  render() {
    return (
      <div className={styles.root}>
        <header>
          <h1>Product Lines</h1>
        </header>
        <ul>
          {this.props.productLines.map(productLine => (
            <ProductLine
              key={productLine.id}
              productLine={productLine}
              jobs={this.props.jobs[productLine.id]}
              selectedJobIds={this.props.selectedJobIds}
              fetchJobs={sinceDate => this.props.onFetchJobs(productLine.id, sinceDate)}
              onJobHoverIn={this.props.onJobHoverIn}
              onJobHoverOut={this.props.onJobHoverOut}
              onJobSelect={this.props.onJobSelect}
              onJobDeselect={this.props.onJobDeselect}
            />
          ))}
          {this.props.isFetching && (
            <li className={styles.placeholder}>
              Loading Product Lines
            </li>
          )}
        </ul>
      </div>
    )
  }
}

export default connect(state => ({
  isFetching:     state.productLines.fetching,
  jobs:           state.productLineJobs,
  productLines:   state.productLines.records,
  selectedJobIds: state.productLineJobs.selection.map(j => j.id),
}), dispatch => ({
  fetchProductLines: () => dispatch(fetchProductLines()),
  onFetchJobs:       (id, sinceDate) => dispatch(fetchProductLineJobs(id, sinceDate)),
  onJobHoverIn:      (job) => dispatch(hoverProductLineJob(job)),
  onJobHoverOut:     () => dispatch(clearHoveredProductLineJob()),
  onJobSelect:       (job) => dispatch(selectProductLineJob(job)),
  onJobDeselect:     () => dispatch(clearSelectedProductLineJob()),
}))(ProductLineList)

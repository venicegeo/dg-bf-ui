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
import {connect} from 'react-redux'
import {
  fetchProductLines,
  fetchProductLineJobs,
  lookupProductLineJob,
} from '../actions'

const styles = require('./ProductLineList.css')

import {
  KEY_JOB_IDS,
  KEY_NAME,
} from '../constants'

export class ProductLineList extends React.Component {
  static propTypes = {
    isFetching:              React.PropTypes.bool,
    productLines:            React.PropTypes.array,
    productLineJobs:         React.PropTypes.object,
    fetchJobsForProductLine: React.PropTypes.func,
    fetchProductLines:       React.PropTypes.func,
  }

  componentDidMount() {
    this.props.fetchProductLines()

    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
    window.productLineList = this
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG

    // DEBUG
    setTimeout(() => this.props.fetchJobsForProductLine('MALAYSIA', '2016-08-01T00:00:00Z', 1), 300)
    // DEBUG
  }

  render() {
    const {isFetching, productLines} = this.props
    return (
      <div className={styles.root}>
        <header>
          <h1>Product Lines</h1>
        </header>
        <ul>
          {productLines.map(p => (
            <li key={p.id} className={styles.productLine}>
              {p.properties[KEY_NAME]}
              <ul>
                {p.properties[KEY_JOB_IDS].map(jobId => (
                  <li>
                    {this.props.productLineJobs[p.id] && this.props.productLineJobs[p.id][jobId]
                      ? this.props.productLineJobs[p.id][jobId].properties[KEY_NAME]
                      : 'ZZZ'
                    }
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {isFetching && (
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
  isFetching:      state.productLines.fetching,
  productLines:    state.productLines.records,
  productLineJobs: state.productLines.jobs,
}), dispatch => ({
  fetchJobsForProductLine: (id, sinceDate, pageNumber) => dispatch(fetchProductLineJobs(id, sinceDate, pageNumber)),
  fetchProductLines:       () => dispatch(fetchProductLines()),
  lookupProductLineJob:    (productLineId, jobId) => dispatch(lookupProductLineJob(productLineId, jobId)),
}))(ProductLineList)

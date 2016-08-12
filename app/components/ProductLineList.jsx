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
} from '../actions'

const styles = require('./ProductLineList.css')

import {
  KEY_CREATED_ON,
  KEY_NAME,
} from '../constants'

export class ProductLineList extends React.Component {
  static propTypes = {
    isFetching:        React.PropTypes.bool,
    jobs:              React.PropTypes.object,
    productLines:      React.PropTypes.array,
    fetchJobs:         React.PropTypes.func,
    fetchProductLines: React.PropTypes.func,
  }

  componentDidMount() {
    this.props.fetchProductLines()
  }

  render() {
    const {isFetching, productLines, jobs} = this.props
    const ____sincedate____ = '2016-08-01T00:00:00Z'
    return (
      <div className={styles.root}>
        <header>
          <h1>Product Lines</h1>
        </header>
        <ul>
          {productLines.map(p => (
            <li key={p.id} className={styles.productLine}>
              <h3>{p.properties[KEY_NAME]}</h3>
              <button onClick={() => this.props.fetchJobs(p.id, ____sincedate____)}>
                Fetch since Aug 1
              </button>
              <ul>
                {(jobs[p.id] && jobs[p.id].error) && (
                  <li>Error fetching stuff</li>
                )}
                {jobs[p.id] && jobs[p.id].records.filter(jobFilter(____sincedate____)).map((job, index) => (
                  <li key={index}>
                    {job.properties
                      ? <div>
                        {job.properties[KEY_NAME].replace('landsat:', '')}{' '}
                        ({job.properties[KEY_CREATED_ON].substr(0, 11)})
                      </div>
                      : <div style={{backgroundColor: '#888', color: 'transparent'}}>loading</div>
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
  isFetching:   state.productLines.fetching,
  jobs:         state.productLineJobs,
  productLines: state.productLines.records,
}), dispatch => ({
  fetchJobs:         (id, sinceDate) => dispatch(fetchProductLineJobs(id, sinceDate)),
  fetchProductLines: () => dispatch(fetchProductLines()),
}))(ProductLineList)

//
// Helpers
//

function jobFilter(sinceDate) {
  return job => job.loading || (job.properties && job.properties[KEY_CREATED_ON] > sinceDate)
}

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
import {LoadingAnimation} from './LoadingAnimation'
import {ProductLine} from './ProductLine'

interface Props {
  error: { message: string, code?: number }
  isFetching: boolean
  productLines: beachfront.ProductLine[]
  onFetch()
  onFetchJobs(productLineId: string, sinceDate: string)
  onJobHoverIn(job: beachfront.Job)
  onJobHoverOut()
  onJobSelect(job: beachfront.Job)
  onJobDeselect()
  onPanTo(productLine: beachfront.ProductLine)
}

export class ProductLineList extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.onFetch()
  }

  render() {
    const isEmpty = !this.props.productLines.length && !this.props.isFetching && !this.props.error
    return (
      <div className={`${styles.root} ${isEmpty ? styles.isEmpty : ''}`}>
        <header>
          <h1>Product Lines</h1>
        </header>
        <ul>
          {this.props.error && (
            <li className={styles.error}>
              <h4><i className="fa fa-warning"/> {this.props.error.code ? 'Communication' : 'Application'} Error</h4>
              <p>{this.props.error.code
                ? 'Cannot communicate with the server'
                : 'An error is preventing the display of product lines'
              }. (<code>{this.props.error.message}</code>)</p>
              <button onClick={this.props.onFetch}>Retry</button>
            </li>
          )}
          {this.props.productLines.map(productLine => (
            <ProductLine
              className={styles.listItem}
              key={productLine.id}
              productLine={productLine}
              onFetchJobs={this.props.onFetchJobs}
              onJobHoverIn={this.props.onJobHoverIn}
              onJobHoverOut={this.props.onJobHoverOut}
              onJobSelect={this.props.onJobSelect}
              onJobDeselect={this.props.onJobDeselect}
              onPanTo={this.props.onPanTo}
            />
          ))}
          {isEmpty && (
            <li className={styles.placeholder}>No product lines currently exist</li>
          )}
          {this.props.isFetching && (
            <li className={styles.loadingMask}>
              <LoadingAnimation className={styles.loadingAnimation}/>
            </li>
          )}
        </ul>
      </div>
    )
  }
}

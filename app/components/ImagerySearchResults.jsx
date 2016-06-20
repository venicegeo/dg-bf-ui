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
import {paginate} from '../utils/pagination'
import styles from './ImagerySearchResults.css'

export default class ImagerySearchResults extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    imagery: React.PropTypes.shape({
      count: React.PropTypes.number.isRequired,
      startIndex: React.PropTypes.number.isRequired,
      totalCount: React.PropTypes.number.isRequired
    }),
    isSearching: React.PropTypes.bool,
    onPageChange: React.PropTypes.func.isRequired
  }

  constructor() {
    super()
    this._emitPageBack = this._emitPageBack.bind(this)
    this._emitPageForward = this._emitPageForward.bind(this)
  }

  render() {
    return (
      <div className={`${styles.root} ${this.props.className || ''}`}>
        {this.props.imagery && this._renderContent(this.props.imagery)}
      </div>
    )
  }

  _renderContent(imagery) {
    if (this.props.isSearching) {
      return <div className={styles.searching}><span>Searching for Imagery...</span></div>
    }
    if (!imagery.totalCount) {
      return <div className={styles.noResults}>No imagery found</div>
    }
    const {page, pages} = paginate(imagery)
    return (
      <div className={styles.pager}>
        <button disabled={page <= 1} onClick={this._emitPageBack}><i className="fa fa-chevron-left"/></button>
        <span>Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={this._emitPageForward}><i className="fa fa-chevron-right"/></button>
      </div>
    )
  }

  _emitPageBack() {
    const {count, startIndex} = this.props.imagery
    this.props.onPageChange({
      count,
      startIndex: startIndex - count
    })
  }

  _emitPageForward() {
    const {count, startIndex} = this.props.imagery
    this.props.onPageChange({
      count,
      startIndex: startIndex + count
    })
  }
}

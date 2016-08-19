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

const styles = require('./ProductLine.css')

import * as React from 'react'
import * as moment from 'moment'
import {Link} from 'react-router'
import {featureToAnchor} from '../utils/map-anchor'
import ActivityTable from './ActivityTable'
import {TypeCollection as TypeJobCollection} from '../store/reducers/productLineJobs'

interface Props {
  jobs: TypeJobCollection
  productLine: beachfront.ProductLine
  selectedJobIds: string[]
  fetchJobs(sinceDate: string)
  onJobHoverIn(job: beachfront.Job)
  onJobHoverOut(job: beachfront.Job)
  onJobSelect(job: beachfront.Job)
  onJobDeselect()
}

interface State {
  isExpanded?: boolean
  sinceDate?: string
}

export default class ProductLine extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      isExpanded: false,
      sinceDate: last24Hours(),
    }
    this._handleExpansionToggle = this._handleExpansionToggle.bind(this)
    this._handleJobRowClick = this._handleJobRowClick.bind(this)
    this._handleSinceDateChange = this._handleSinceDateChange.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isExpanded && (prevState.isExpanded !== this.state.isExpanded || prevState.sinceDate !== this.state.sinceDate)) {
      this.props.fetchJobs(this.state.sinceDate)
    }
  }

  render() {
    const {jobs, productLine} = this.props
    const {properties} = productLine
    const {isExpanded, sinceDate} = this.state
    return (
      <li className={`${styles.root} ${isExpanded ? styles.isExpanded : ''}`}>
        <section className={styles.header} onClick={this._handleExpansionToggle}>
          <h3 className={styles.title}>
            <i className={`fa fa-chevron-right ${styles.caret}`}/>
            <span>{properties.name}</span>
          </h3>
          <Link to={{pathname: '/product-lines', hash: featureToAnchor(productLine)}} className={styles.viewButton}>
            <i className="fa fa-globe"/>
          </Link>
        </section>
        <section className={styles.details}>
          <div className={styles.metadata}>
            <dl>
              <dt>Scheduling</dt>
              <dd>{formatDate(properties.startsOn)} &mdash; {formatDate(properties.expiresOn) || 'Forever'}</dd>
              <dt>Algorithm</dt>
              <dd>{properties.algorithmName}</dd>
              <dt>Cloud Cover</dt>
              <dd>{properties.imageCloudCover}</dd>
              {/*
              <dt>Compute Mask</dt>
              <dd>{computeMask}</dd>
              */}
              <dt>Spatial Filter</dt>
              <dd>{titleCase(properties.spatialFilterName)}</dd>
              <dt>Owner</dt>
              <dd>{properties.owner}</dd>
              <dt>Date Created</dt>
              <dd>{formatDate(properties.createdOn)}</dd>
            </dl>
          </div>
          <ActivityTable
            className={styles.activityTable}
            jobs={jobs.records.filter(jobFilter(sinceDate))}
            selectedJobIds={this.props.selectedJobIds}
            error={jobs.error}
            sinceDate={sinceDate}
            sinceDates={[
              {value: last24Hours(), label: 'Last 24 Hours'},
              {value: last7Days(), label: 'Last 7 Days'},
              {value: last30Days(), label: 'Last 30 Days'},
              {value: properties.createdOn, label: 'All'},
            ]}
            onHoverIn={this.props.onJobHoverIn}
            onHoverOut={this.props.onJobHoverOut}
            onRowClick={this._handleJobRowClick}
            onSinceDateChange={this._handleSinceDateChange}
          />
        </section>
      </li>
    )
  }

  _handleExpansionToggle() {
    this.setState({ isExpanded: !this.state.isExpanded })
    // TODO -- scroll to positioning
  }

  _handleJobRowClick(job) {
    if (this.props.selectedJobIds.includes(job.id)) {
      this.props.onJobDeselect()
    }
    else {
      this.props.onJobSelect(job)
    }
  }

  _handleSinceDateChange(sinceDate) {
    this.setState({ sinceDate })
  }
}

//
// Helpers
//

function formatDate(input) {
  const date = moment(input)
  if (date.isValid()) {
    return date.format('MM/DD/YYYY')
  }
  return null
}

function jobFilter(sinceDate) {
  return job => job.loading || (job.properties && job.properties.createdOn > sinceDate)
}

function last24Hours() {
  return moment().subtract(24, 'hours').startOf('hour').toISOString()
}

function last7Days() {
  return moment().subtract(7, 'days').startOf('hour').toISOString()
}

function last30Days() {
  return moment().subtract(30, 'days').startOf('hour').toISOString()
}

function titleCase(s) {
  return s.replace(/((?:^|\s)[a-z])/g, c => c.toUpperCase())
}

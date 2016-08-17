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

import React from 'react'
import moment from 'moment'
import ActivityTable from './ActivityTable'

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_EXPIRES_ON,
  KEY_IMAGE_CLOUDCOVER,
  KEY_NAME,
  KEY_OWNER,
  KEY_SPATIAL_FILTER_NAME,
  KEY_STARTS_ON,
} from '../constants'

export default class ProductLine extends React.Component {
  static propTypes = {
    jobs:        React.PropTypes.object.isRequired,
    productLine: React.PropTypes.object.isRequired,
    fetchJobs:   React.PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {
      isExpanded: false,
      selectedJobId: null,
      sinceDate: last24Hours(),
    }
    this._handleExpansionToggle = this._handleExpansionToggle.bind(this)
    this._handleJobSelect = this._handleJobSelect.bind(this)
    this._handleSinceDateChange = this._handleSinceDateChange.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isExpanded && (prevState.isExpanded !== this.state.isExpanded || prevState.sinceDate !== this.state.sinceDate)) {
      this.props.fetchJobs(this.state.sinceDate)
    }
  }

  render() {
    const {properties} = this.props.productLine
    const {jobs} = this.props
    const {isExpanded, selectedJobId, sinceDate} = this.state
    return (
      <li className={`${styles.root} ${isExpanded ? styles.isExpanded : ''}`}>
        <section className={styles.header} onClick={this._handleExpansionToggle}>
          <h3 className={styles.title}>
            <i className={`fa fa-chevron-right ${styles.caret}`}/>
            <span>{properties[KEY_NAME]}</span>
          </h3>
          <div className={styles.viewButton}>
            <i className="fa fa-globe"/>
          </div>
        </section>
        <section className={styles.details}>
          <div className={styles.metadata}>
            <dl>
              <dt>Scheduling</dt>
              <dd>{formatDate(properties[KEY_STARTS_ON])} &mdash; {formatDate(properties[KEY_EXPIRES_ON]) || 'Forever'}</dd>
              <dt>Algorithm</dt>
              <dd>{properties[KEY_ALGORITHM_NAME]}</dd>
              <dt>Cloud Cover</dt>
              <dd>{properties[KEY_IMAGE_CLOUDCOVER]}</dd>
              {/*
              <dt>Compute Mask</dt>
              <dd>{computeMask}</dd>
              */}
              <dt>Spatial Filter</dt>
              <dd>{titleCase(properties[KEY_SPATIAL_FILTER_NAME])}</dd>
              <dt>Owner</dt>
              <dd>{properties[KEY_OWNER]}</dd>
              <dt>Date Created</dt>
              <dd>{formatDate(properties[KEY_CREATED_ON])}</dd>
            </dl>
          </div>
          <ActivityTable
            className={styles.activityTable}
            jobs={jobs.records.filter(jobFilter(sinceDate))}
            selectedJobId={selectedJobId}
            error={jobs.error}
            sinceDate={sinceDate}
            sinceDates={[
              {value: last24Hours(), label: 'Last 24 Hours'},
              {value: last7Days(), label: 'Last 7 Days'},
              {value: last30Days(), label: 'Last 30 Days'},
              {value: properties[KEY_CREATED_ON], label: 'All'},
            ]}
            onHoverIn={job => console.debug('onHoverIn ->', job)}
            onHoverOut={job => console.debug('onHoverOut ->', job)}
            onRowClick={this._handleJobSelect}
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

  _handleJobSelect(job) {
    this.setState({
      selectedJobId: job ? job.id : null,
    })
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
  return job => job.loading || (job.properties && job.properties[KEY_CREATED_ON] > sinceDate)
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

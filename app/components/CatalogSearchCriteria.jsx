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

const styles = require('./CatalogSearchCriteria.css')

import React from 'react'
import StaticMinimap from './StaticMinimap'

const CatalogSearchCriteria = (props) => (
  <div className={styles.root}>
    <div className={styles.minimap}>
      <StaticMinimap bbox={props.bbox}/>
      <div className={styles.clearBbox} onClick={props.onClearBbox}>
        <i className="fa fa-times-circle"/> Clear
      </div>
    </div>

    {props.errorElement}

    <h3>Catalog</h3>
    <label className={styles.provider}>
      <span>Provider</span>
      <select disabled={true}>
        <option>Planet Labs (LANDSAT)</option>
      </select>
    </label>
    <label className={styles.apiKey}>
      <span>API Key</span>
      <input
        value={props.apiKey}
        type="password"
        disabled={props.disabled}
        onChange={event => props.onApiKeyChange(event.target.value)}
      />
    </label>

    {(props.dateFrom && props.dateTo) && (
      <div>
        <h3>Date of Capture</h3>

        <label className={styles.captureDateFrom}>
          <span>From</span>
          <input
            value={props.dateFrom}
            type="date"
            disabled={props.disabled}
            onChange={event => props.onDateChange(event.target.value, props.dateTo)}
          />
        </label>
        <label className={styles.captureDateTo}>
          <span>To</span>
          <input
            value={props.dateTo}
            type="date"
            disabled={props.disabled}
            onChange={event => props.onDateChange(props.dateFrom, event.target.value)}
          />
        </label>
      </div>
    )}

    <h3>Filters</h3>
    <label className={styles.cloudCover}>
      <span>Cloud Cover</span>
      <input
        value={props.cloudCover}
        type="range"
        min="0"
        max="100"
        onChange={event => props.onCloudCoverChange(parseInt(event.target.value, 10))}
      />
      <span className={styles.value}>{props.cloudCover > 0 && '< '}{props.cloudCover}%</span>
    </label>
    <label className={styles.spatialFilter}>
      <span>Spatial Filter</span>
      <select
        value={props.filter || ''}
        onChange={event => props.onFilterChange(event.target.value || null)}
        >
        <option value="">None</option>
        {props.filters.map(({id, name}) => (
          <option key={id} value={id}>{titleCase(name)}</option>
        ))}
      </select>
    </label>
  </div>
)

CatalogSearchCriteria.propTypes = {
  apiKey:             React.PropTypes.string,
  bbox:               React.PropTypes.array.isRequired,
  cloudCover:         React.PropTypes.number.isRequired,
  dateFrom:           React.PropTypes.string,
  dateTo:             React.PropTypes.string,
  disabled:           React.PropTypes.bool,
  errorElement:       React.PropTypes.element,
  filter:             React.PropTypes.string,
  filters:            React.PropTypes.arrayOf(React.PropTypes.shape({
    id:   React.PropTypes.string,
    name: React.PropTypes.string,
  })).isRequired,
  onApiKeyChange:     React.PropTypes.func.isRequired,
  onClearBbox:        React.PropTypes.func.isRequired,
  onCloudCoverChange: React.PropTypes.func.isRequired,
  onDateChange:       React.PropTypes.func,
  onFilterChange:     React.PropTypes.func.isRequired,
}

export default CatalogSearchCriteria

//
// Helpers
//

function titleCase(s) {
  return s.replace(/((?:^|\s)[a-z])/g, c => c.toUpperCase())
}

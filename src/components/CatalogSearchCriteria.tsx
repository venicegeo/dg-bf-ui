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

const styles: any = require('./CatalogSearchCriteria.css')

import * as React from 'react'
import {StaticMinimap} from './StaticMinimap'

interface Props {
  apiKey: string
  bbox: number[]
  cloudCover: number
  dateFrom?: string
  dateTo?: string
  disabled?: boolean
  errorElement?: React.ReactElement<any>
  onApiKeyChange(apiKey: string)
  onClearBbox()
  onCloudCoverChange(cloudCover: number)
  onDateChange?(dateFrom: string, dateTo: string)
  onFilterChange(filter: string)
}

export const CatalogSearchCriteria = (props: Props) => (
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
        onChange={event => props.onApiKeyChange((event.target as HTMLInputElement).value)}
      />
    </label>

    {(typeof props.dateFrom !== 'undefined' && typeof props.dateTo !== 'undefined') && (
      <div>
        <h3>Date of Capture</h3>

        <label className={styles.captureDateFrom}>
          <span>From</span>
          <input
            value={props.dateFrom}
            type="text"
            disabled={props.disabled}
            onChange={event => props.onDateChange((event.target as HTMLInputElement).value, props.dateTo)}
          />
        </label>
        <label className={styles.captureDateTo}>
          <span>To</span>
          <input
            value={props.dateTo}
            type="text"
            disabled={props.disabled}
            onChange={event => props.onDateChange(props.dateFrom, (event.target as HTMLInputElement).value)}
          />
        </label>
      </div>
    )}

    <h3>Filters</h3>
    <label className={styles.cloudCover}>
      <span>Cloud Cover</span>
      <input
        value={props.cloudCover.toString()}
        type="range"
        min="0"
        max="100"
        onChange={event => props.onCloudCoverChange(parseInt((event.target as HTMLInputElement).value, 10))}
      />
      <span className={styles.value}>{props.cloudCover > 0 && '< '}{props.cloudCover}%</span>
    </label>
  </div>
)

//
// Helpers
//

function titleCase(s) {
  return s.replace(/((?:^|\s)[a-z])/g, c => c.toUpperCase())
}

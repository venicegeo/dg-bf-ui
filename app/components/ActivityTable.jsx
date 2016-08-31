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
import moment from 'moment'
import {SinceDateSelect} from './SinceDateSelect'

const styles = require('./ActivityTable.css')

import {
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_ID,
  KEY_IMAGE_SENSOR,
} from '../constants'

const PLACEHOLDER = <span className={styles.placeholder}/>

export const ActivityTable = ({
  className,
  jobs,
  selectedJobIds,
  sinceDate,
  sinceDates,
  onHoverIn,
  onHoverOut,
  onRowClick,
  onSinceDateChange,
}) => (
  <div className={`${styles.root} ${className}`}>

    <div className={styles.filter}>
      Activity:
      <SinceDateSelect
        className={styles.filterDropdown}
        options={sinceDates}
        value={sinceDate}
        onChange={onSinceDateChange}
      />
    </div>

    <div className={styles.progressbar}>
      <div className={styles.puck}/>
    </div>

    <div className={styles.shadowTop}/>
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>Image ID</th>
            <th>Captured On</th>
            <th>Sensor</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr
              key={job.id}
              className={selectedJobIds.includes(job.id) ? styles.isActive : ''}
              onClick={() => onRowClick(job)}
              onMouseEnter={() => job.properties && onHoverIn(job)}
              onMouseLeave={() => job.properties && onHoverOut(job)}
              >
              <td>
                {job.properties
                  ? getImageId(job)
                  : PLACEHOLDER
                }
              </td>
              <td>
                {job.properties
                  ? getCapturedOn(job)
                  : PLACEHOLDER
                }
              </td>
              <td>
                {job.properties
                  ? getImageSensor(job)
                  : PLACEHOLDER
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className={styles.shadowBottom}/>
  </div>
)

ActivityTable.propTypes = {
  className: React.PropTypes.string,
  error: React.PropTypes.object,
  jobs: React.PropTypes.array.isRequired,
  selectedJobIds: React.PropTypes.arrayOf(React.PropTypes.string),
  sinceDate: React.PropTypes.string.isRequired,
  sinceDates: React.PropTypes.array.isRequired,
  onHoverIn: React.PropTypes.func.isRequired,
  onHoverOut: React.PropTypes.func.isRequired,
  onRowClick: React.PropTypes.func.isRequired,
  onSinceDateChange: React.PropTypes.func.isRequired,
}

//
// Helpers
//

function getCapturedOn({ properties }) {
  const then = moment(properties[KEY_IMAGE_CAPTURED_ON])
  return then.format(then.year() === new Date().getFullYear() ? 'MM/DD' : 'MM/DD/YYYY')
}

function getImageId({ properties }) {
  return properties[KEY_IMAGE_ID].replace(/^landsat:/, '')
}

function getImageSensor({ properties }) {
  return properties[KEY_IMAGE_SENSOR]
}

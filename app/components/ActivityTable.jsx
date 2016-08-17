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

const styles = require('./ActivityTable.css')

import {
  KEY_ALGORITHM_NAME,
  KEY_CREATED_ON,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_ID,
  KEY_IMAGE_SENSOR,
} from '../constants'

const PLACEHOLDER = <span className={styles.placeholder}/>

const ActivityTable = ({
  selectedJobId,
  error,
  jobs,
  sinceDate,
  onRowClick,
  onHoverIn,
  onHoverOut,
}) => (
  <div className={styles.root}>

    <div className={styles.filter}>
      Activity: <span className={styles.filterValue}>Last 24 Hours</span> <i className="fa fa-chevron-down"/>
    </div>
    <div className={styles.loadingIndicator}>
      <div className={styles.puck}/>
    </div>

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
              className={selectedJobId === job.id ? styles.isActive : ''}
              onClick={() => onRowClick(job)}
              onMouseEnter={() => onHoverIn(job)}
              onMouseLeave={() => onHoverOut(job)}
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
  </div>
)

ActivityTable.propTypes = {
  error: React.PropTypes.object,
  jobs: React.PropTypes.array.isRequired,
  selectedJobId: React.PropTypes.string,
  sinceDate: React.PropTypes.string.isRequired,
  onRowClick: React.PropTypes.func.isRequired,
  onHoverIn: React.PropTypes.func.isRequired,
  onHoverOut: React.PropTypes.func.isRequired,
}

export default ActivityTable

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

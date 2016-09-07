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
import {Dropdown} from './Dropdown'
import {FileDownloadLink} from './FileDownloadLink'
import LoadingAnimation from './LoadingAnimation'

const styles = require('./ActivityTable.css')

import {
  KEY_GEOJSON_DATA_ID,
  KEY_IMAGE_CAPTURED_ON,
  KEY_IMAGE_ID,
  KEY_IMAGE_SENSOR,
  KEY_NAME,
} from '../constants'

export const ActivityTable = ({
  className,
  duration,
  durations,
  isLoading,
  jobs,
  selectedJobIds,
  sessionToken,
  onHoverIn,
  onHoverOut,
  onRowClick,
  onDurationChange,
}) => (
  <div className={`${styles.root} ${isLoading ? styles.isLoading : ''} ${className}`}>

    <div className={styles.filter}>
      Activity:
      <Dropdown
        className={styles.filterDropdown}
        options={durations}
        value={duration}
        onChange={onDurationChange}
      />
    </div>

    <div className={styles.shadowTop}/>
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>Image ID</th>
            <th>Captured On</th>
            <th>Sensor</th>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr
              key={job.id}
              className={selectedJobIds.includes(job.id) ? styles.isActive : ''}
              onClick={() => onRowClick(job)}
              onMouseEnter={() => onHoverIn(job)}
              onMouseLeave={() => onHoverOut(job)}
              >
              <td>{getImageId(job)}</td>
              <td>{getCapturedOn(job)}</td>
              <td>{getImageSensor(job)}</td>
              <td className={styles.downloadCell} onClick={e => e.stopPropagation()}>
                <FileDownloadLink
                  sessionToken={sessionToken}
                  className={styles.downloadButton}
                  dataId={job.properties[KEY_GEOJSON_DATA_ID]}
                  filename={job.properties[KEY_NAME] + '.geojson'}
                  onComplete={() => console.log('onComplete')}
                  onError={() => console.log('onError')}
                  onProgress={() => console.log('onProgress')}
                  onStart={() => console.log('onStart')}
                />
              </td>
            </tr>
          ))}
          {isLoading && generatePlaceholderRows(10)}
        </tbody>
      </table>
    </div>
    <div className={styles.shadowBottom}/>
    {isLoading && (
      <div className={styles.loadingMask}>
        <LoadingAnimation className={styles.loadingAnimation}/>
      </div>
    )}
  </div>
)

ActivityTable.propTypes = {
  className: React.PropTypes.string,
  duration: React.PropTypes.string.isRequired,
  durations: React.PropTypes.array.isRequired,
  error: React.PropTypes.object,
  isLoading: React.PropTypes.bool.isRequired,
  jobs: React.PropTypes.array.isRequired,
  selectedJobIds: React.PropTypes.arrayOf(React.PropTypes.string),
  sessionToken: React.PropTypes.string.isRequired,
  onHoverIn: React.PropTypes.func.isRequired,
  onHoverOut: React.PropTypes.func.isRequired,
  onRowClick: React.PropTypes.func.isRequired,
  onDurationChange: React.PropTypes.func.isRequired,
}

//
// Helpers
//

function generatePlaceholderRows(count) {
  const rows = []
  for (let i = 0; i < count; i++) {
    rows.push(
      <tr key={i} className={styles.placeholder}>
        <td><span/></td>
        <td><span/></td>
        <td><span/></td>
        <td><span/></td>
      </tr>
    )
  }
  return rows
}

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

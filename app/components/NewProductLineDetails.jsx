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

const styles = require('./NewProductLineDetails.css')

import React from 'react'

const NewProductLineDetails = ({ name, dateStart, dateStop, onNameChange, onDateChange }) => (
  <div className={styles.root}>
    <h2>Product Line Details</h2>

    <h3>Name</h3>
    <label className={styles.name}>
      <input
        type="text"
        value={name}
        onChange={event => onNameChange(event.target.value)}
      />
    </label>

    <h3>Scheduling</h3>
    <label className={styles.dateStart}>
      <span>Date To Begin</span>
      <input
        type="date"
        value={dateStart}
        onChange={event => onDateChange(event.target.value, dateStop)}
      />
    </label>
    <label className={styles.dateStop}>
      <span>Date To End</span>
      <input
        type="date"
        value={dateStop}
        onChange={event => onDateChange(dateStart, event.target.value)}
      />
    </label>
  </div>
)

NewProductLineDetails.propTypes = {
  dateStart:    React.PropTypes.string,
  dateStop:     React.PropTypes.string,
  name:         React.PropTypes.string.isRequired,
  onDateChange: React.PropTypes.func.isRequired,
  onNameChange: React.PropTypes.func.isRequired,
}

export default NewProductLineDetails

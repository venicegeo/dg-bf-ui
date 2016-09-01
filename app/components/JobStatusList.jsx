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
import JobStatus from './JobStatus'
import styles from './JobStatusList.css'

export const JobStatusList = ({
  activeIds,
  authToken,
  error,
  jobs,
  onDismissError,
  onForgetJob,
  onNavigateToJob,
}) => (
  <div className={`${styles.root} ${!jobs.length ? styles.isEmpty : ''}`}>
    <header>
      <h1>Jobs</h1>
    </header>

    <ul>
      {error && (
        <li className={styles.communicationError}>
          <h4><i className="fa fa-warning"/> Communication Error</h4>
          <p>Cannot communicate with the server. (<code>{error.toString()}</code>)</p>
          <button onClick={onDismissError}>Retry</button>
        </li>
      )}

      {!jobs.length ? (
        <li className={styles.placeholder}>You haven't started any jobs yet</li>
      ) : jobs.map(job => (
        <JobStatus
          key={job.id}
          authToken={authToken}
          isActive={activeIds.includes(job.id)}
          job={job}
          onNavigate={onNavigateToJob}
          onForgetJob={onForgetJob}
        />
      ))}
    </ul>
  </div>
)

JobStatusList.propTypes = {
  authToken: React.PropTypes.string.isRequired,
  error: React.PropTypes.object,
  jobs: React.PropTypes.array.isRequired,
  activeIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  onDismissError: React.PropTypes.func.isRequired,
  onForgetJob: React.PropTypes.func.isRequired,
  onNavigateToJob: React.PropTypes.func.isRequired,
}

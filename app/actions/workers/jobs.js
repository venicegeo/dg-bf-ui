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

import {
  KEY_CREATED_ON,
  KEY_STATUS,
  STATUS_ERROR,
  STATUS_RUNNING,
  STATUS_SUCCESS,
  STATUS_TIMED_OUT,
} from '../../constants'

let _client, _handlers, _instance, _ttl

export function start(client, interval, ttl, {getRecords, onFailure, onTerminate, onUpdate}) {
  if (typeof _instance === 'number') {
    throw new Error('Attempted to start while already running')
  }
  _client = client
  _instance = setInterval(work, interval)
  _handlers = {getRecords, onFailure, onTerminate, onUpdate}
  _ttl = ttl
  work()
}

export function terminate() {
  if (typeof _instance !== 'number') {
    return
  }
  clearInterval(_instance)
  _handlers.onTerminate()
  _instance = null
  _client = null
  _handlers = null
  _ttl = null
}

//
// Internals
//

function work() {
  // TODO -- skip this cycle if already running

  const jobs = getRunningJobs()
  if (!jobs.length) {
    console.debug('(jobs:worker) nothing to do')
    return
  }

  console.debug('(jobs:worker) cycle started')
  Promise.all(jobs.map(fetchUpdates))
    .then(updates => {
      console.debug('(jobs:worker) committing changes')
      updates.forEach(update => {
        _handlers.onUpdate(update.jobId, update.status, update.resultId || null)
      })
    })
    .catch(err => {
      console.error('(jobs:worker) cycle failed; terminating.', err)
      _handlers.onFailure(err)
      terminate()
    })
}

function exceededTTL(createdOn) {
  return (Date.now() - new Date(createdOn).getTime()) > _ttl
}

function fetchGeoJsonId(status) {
  const metadataId = status.result.dataId

  console.debug('(jobs:worker) <%s> resolving file ID (via <%s>)', status.jobId, metadataId)
  return _client.getFile(metadataId)
    .then(normalizeExecutionOutput)
    .then(output => {
      if (!output.resultId) {
        throw new Error('GeoJSON data ID missing from execution output')
      }
      return {...status, resultId: output.resultId}
    })
}

function fetchUpdates(job) {
  return _client.getStatus(job.id)
    .then(status => {
      console.debug('(jobs:worker) <%s> polled (%s)', status.jobId, status.status)

      if (status.status === STATUS_SUCCESS) {
        return fetchGeoJsonId(status)
      }

      else if (exceededTTL(job.properties[KEY_CREATED_ON])) {
        console.warn('(jobs:worker) <%s> appears to have stalled and will no longer be tracked', status.jobId)
        return {...status, status: STATUS_TIMED_OUT}
      }

      return status
    })
    .catch(err => {
      // One update failure should not halt the train
      console.error('(jobs:worker) <%s> update failed:', job.id, err)
      return {jobId: job.id, status: STATUS_ERROR}
    })
}

function getRunningJobs() {
  return _handlers.getRecords()
    .filter(j => j.properties[KEY_STATUS] === STATUS_RUNNING)
}

function normalizeExecutionOutput(raw) {
  try {
    const parsed = JSON.parse(raw)
    return {
      error:      parsed.error || null,
      resultId:   parsed.shoreDataID || null,
      wmsLayerId: parsed.rgbLoc || null
    }
  } catch (err) {
    throw new Error('Execution output could not be parsed')
  }
}

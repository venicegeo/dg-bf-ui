import {
  STATUS_ERROR,
  STATUS_RUNNING,
  STATUS_SUCCESS,
  STATUS_TIMED_OUT
} from '../../constants'

let _client, _handlers, _instance, _ttl

export function start(client, interval, ttl, {select, onFailure, onTerminate, onUpdate}) {
  if (typeof _instance === 'number') {
    throw new Error('Attempted to start while already running')
  }
  _client = client
  _instance = setInterval(work, interval)
  _handlers = {select, onFailure, onTerminate, onUpdate}
  _ttl = ttl
  work()
}

export function terminate() {
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
        _handlers.onUpdate(update.jobId, update.status, update.resultId)
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
    .then(metadata => {
      const guids = metadata.match(/^[0-9a-f-]+$/i)
      if (!guids) {
        throw new Error('Could not find GeoJSON file in execution output')
      }
      return {...status, resultId: guids[0]}
    })
}

function fetchUpdates({id: jobId, createdOn}) {
  return _client.getStatus(jobId)
    .then(status => {
      console.debug('(jobs:worker) <%s> polled (%s)', status.jobId, status.status)

      if (status.status === STATUS_SUCCESS) {
        return fetchGeoJsonId(status)
      }

      else if (exceededTTL(createdOn)) {
        console.warn('(jobs:worker) <%s> appears to have stalled and will no longer be tracked', status.jobId)
        return {...status, status: STATUS_TIMED_OUT}
      }

      return status
    })
    .catch(err => {
      // One update failure should not halt the train
      console.error('(jobs:worker) <%s> update failed:', jobId, err)
      return {jobId, status: STATUS_ERROR}
    })
}

function getRunningJobs() {
  return _handlers.select().records
    .filter(job => job.status === STATUS_RUNNING)
}

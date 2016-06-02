import {JOBS_WORKER} from '../config'

const STATUS_ERROR = 'Error'
const STATUS_RUNNING = 'Running'
const STATUS_SUCCESS = 'Success'
const STATUS_TIMED_OUT = 'Timed Out'

let cache
let subscribers = []

export function initialize(client) {
  deserializeCache()
  return cacheWorker(client)
}

export function execute(client, {catalogApiKey, name, algorithm, feature}) {
  // HACK
  const body = {
    algoType: algorithm.name,
    svcURL: algorithm.url,
    pzAuthToken: client.authToken,
    pzAddr: client.gateway,
    dbAuthToken: catalogApiKey,
    bands: ['green', 'swir1'],  // FIXME
    metaDataJSON: feature
  }
  return fetch('https://bf-handle.int.geointservices.io/execute', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST'
  })
    .then(response => {
      if (response.ok) {
        return response.text()
      }
      throw new Error('ACK!')
    })
    .then(id => {
      appendToCache(new Job({
        id,
        name,
        algorithmName: algorithm.name,
        createdOn: Date.now(),
        status: STATUS_RUNNING
      }))
    })
  // HACK
}

export function getResult(client, resultId, progress) {
  return client.getFile(resultId, progress).then(str => new Result(str, resultId, resultId))
}

export function list() {
  return cache ? cache.slice() : []  // HACK
}

export function subscribe(notifier) {
  subscribers.push(notifier)
  return () => {
    subscribers = subscribers.filter(fn => fn !== notifier)
  }
}

//
// Internals
//

function appendToCache(job) {
  cache = cache.concat(job).sort((a, b) => b.createdOn - a.createdOn)
  serializeCache()
}

function cacheWorker(client) {
  const handle = setInterval(work, JOBS_WORKER.INTERVAL)
  const terminate = () => clearTimeout(handle)
  work()

  function work() {
    const outstanding = cache.filter(job => job.status === STATUS_RUNNING)
    if (!outstanding.length) {
      console.debug('(jobs:cacheWorker) nothing to do')
      return
    }
    Promise.all(outstanding.map(__update__))
      .then(() => {
        console.debug('(jobs:cacheWorker) committing changes')
        serializeCache()
      })
      .catch(err => {
        console.error(err)
        notifySubscribers(err)
      })
  }

  function __update__(job) {
    return client.getStatus(job.id)
      .then(status => {
        console.debug('(jobs:cacheWorker) <%s> poll (%s)', job.id, status.status)

        if (status.status === STATUS_SUCCESS) {
          job.status = STATUS_SUCCESS
          return __resolve__(job, status)
        }

        else if (status.status === STATUS_ERROR) {
          job.status = STATUS_ERROR
        }

        else if (calculateDuration(job) > JOBS_WORKER.JOB_TTL) {
          console.warn('(jobs:cacheWorker) <%s> has timed out', job.id)
          job.status = STATUS_TIMED_OUT
        }
      })
      .catch(err => {
        job.status = STATUS_ERROR
        console.error('(jobs:cacheWorker) <%s> update failed:', job.id, err)
      })
  }

  function __resolve__(job, status) {
    const metadataId = status.result.dataId
    console.debug('(jobs:cacheWorker) <%s> resolving file ID (via <%s>)', job.id, metadataId)
    return client.getFile(metadataId)
      .then(executionOutput => {
        const files = extractOutputFiles(executionOutput)
        if (!files) {
          throw new Error(`Invalid execution output:\n\`${executionOutput}\``)
        }

        const geojsonId = extractGeojsonId(files)
        if (!geojsonId) {
          throw new Error('Could not find GeoJSON file in execution output')
        }

        job.resultId = geojsonId
      })
  }

  return {terminate}
}

function calculateDuration(job) {
  return Date.now() - new Date(job.createdOn).getTime()
}

function deserializeCache() {
  cache = (JSON.parse(sessionStorage.getItem('jobs')) || []).map(raw => new Job(raw))
}

function extractGeojsonId(outputFiles) {
  const pattern  = /^Beachfront_(.*)\.geojson$/
  const filename = Object.keys(outputFiles).find(key => pattern.test(key))
  return outputFiles[filename]
}

function extractOutputFiles(executionOutput) {
  try {
    return JSON.parse(executionOutput).OutFiles
  } catch (_) {
    // do nothing
  }
}

function generateOutputFilename() {
  const timestamp = new Date().toISOString().replace(/[-:Z]/g, '').replace(/T/, '.')
  return `Beachfront_${timestamp}.geojson`
}

function notifySubscribers(cacheError) {
  console.debug('(jobs.notifySubscribers)', cacheError)
  subscribers.forEach(notify => notify(cacheError))
}

function serializeCache() {
  sessionStorage.setItem('jobs', JSON.stringify(cache))
  notifySubscribers()
}

//
// Data Structures
//

class Job {
  constructor(raw) {
    this.algorithmName = raw.algorithmName
    this.createdOn = new Date(raw.createdOn)
    this.id = raw.id
    this.name = raw.name
    this.resultId = raw.resultId
    this.status = raw.status
    this.imageIds = raw.imageIds
    this.bbox = raw.bbox
  }
}

class Result {
  constructor(geojson, id, name) {
    this.geojson = geojson
    this.id = id
    this.name = name
  }
}

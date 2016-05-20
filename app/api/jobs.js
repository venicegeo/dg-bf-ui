import {JOBS_WORKER} from '../config'

const STATUS_ERROR = 'Error'
const STATUS_RUNNING = 'Running'
const STATUS_SUCCESS = 'Success'
const STATUS_TIMED_OUT = 'Timed Out'

let cache

export function initialize(client) {
  deserializeCache()
  return cacheWorker(client)
}

export function execute(client, {name, algorithmId, algorithmName, imageIds}) {
  const outputFilename = generateOutputFilename()
  const imageFilenames = imageIds.map(s => s + '.TIF').join(',')
  return client.post('execute-service', {
    dataInputs: {
      cmd: {
        content: `shoreline --image ${imageFilenames} --projection geo-scaled --threshold 0.5 --tolerance 0 ${outputFilename}`,
        type: 'urlparameter'
      },
      inFiles: {
        content: imageIds.join(','),
        type: 'urlparameter'
      },
      outGeoJson: {
        content: outputFilename,
        type: 'urlparameter'
      }
    },
    dataOutput: [
      {
        mimeType: 'application/json',
        type: 'text'
      }
    ],
    serviceId: algorithmId
  })
    .then(id => {
      appendToCache(new Job({
        algorithmName,
        id,
        imageIds,
        name,
        createdOn: Date.now(),
        status: STATUS_RUNNING
      }))
      return id
    })
}

export function list() {
  return Promise.resolve(cache.sort((a, b) => b.createdOn - a.createdOn))
}

export function getResult(client, resultId) {
  return client.getFile(resultId).then(str => new Result(str, resultId, resultId))
}

//
// Internals
//

function appendToCache(job) {
  cache.push(job)
  serializeCache()
}

function cacheWorker(client) {
  const handle = setInterval(work, JOBS_WORKER.INTERVAL)
  const terminate = () => clearTimeout(handle)
  work()

  function work() {

    const outstanding = cache.filter(j => j.status === STATUS_RUNNING)
    if (!outstanding.length) {
      console.debug('(jobs.cacheWorker) nothing to do')
      return
    }

    console.debug('(jobs.cacheWorker) updating %d records', outstanding.length)

    // todo -- don't interlace the status and resolve calls

    // get updates

    // for all success, resolve result id

    const promises = outstanding.map((job, index) => {

      return client.getStatus(job.id).then(status => {
        console.debug('(jobs.cacheWorker) [%d/%d] <%s> poll (%s)', index + 1, outstanding.length, job.id, status.status)

        if (status.status === STATUS_SUCCESS) {
          job.status = STATUS_SUCCESS
          return resolveResultId(client, job, status)
        }

        else if (status.status === STATUS_ERROR) {
          job.status = STATUS_ERROR
          return
        }

        // if still not resolved, stop tracking
        const age = Date.now() - new Date(job.createdOn).getTime()
        if (age > JOBS_WORKER.JOB_TTL) {
          console.warn('(jobs.cacheWorker) <%s> disregarding stalled job', job.id)
          job.status = STATUS_TIMED_OUT
        }

      }).catch(err => {
        // TODO -- need better logic for this
        job.status = STATUS_ERROR
        console.error(err)
      }).then(() => job.id)
    })

    Promise.all(promises)
      .then(ids => {
        if (!ids.length) {
          console.debug('(jobs.cacheWorker) no changes')
          return
        }
        console.debug('(jobs.cacheWorker) saving %d updates', ids.length)
        serializeCache()
      })
      .catch(err => console.error(err))
  }

  return {terminate}
}

function deserializeCache() {
  cache = (JSON.parse(sessionStorage.getItem('jobs')) || []).map(raw => new Job(raw))
}

function extractFileId(outputFiles) {
  const pattern  = /^Beachfront_(.*)\.geojson$/
  const filename = Object.keys(outputFiles).find(key => pattern.test(key))
  return outputFiles[filename]
}

function generateOutputFilename() {
  const timestamp = new Date().toISOString().replace(/[-:Z]/g, '').replace(/T/, '.')
  return `Beachfront_${timestamp}.geojson`
}

function resolveResultId(client, job, status) {
  const metadataId = status.result.dataId

  console.debug('(jobs.resolveResultId) <%s> Fetching metadata', metadataId)

  return client.getFile(metadataId).then(metadataString => {
    let outputFiles
    try {
      outputFiles = JSON.parse(metadataString).OutFiles
    } catch (err) {
      throw new Error(`MetadataParsingError: \`${metadataString}\``)
    }

    const geojsonId = extractFileId(outputFiles)
    if (!geojsonId) {
      throw new Error('Could not find GeoJSON file in metadata')
    }

    job.resultId = geojsonId
  })
  .catch(err => {
    console.error('(jobs.resolveResultId) <%s> Failed:', metadataId, err)
  })
}

function serializeCache() {
  sessionStorage.setItem('jobs', JSON.stringify(cache))
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
  }
}

class Result {
  constructor(geojson, id, name) {
    this.geojson = geojson
    this.id = id
    this.name = name
  }
}

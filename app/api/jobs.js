import {JOBS_WORKER} from '../config'

const {POLL_INTERVAL, POLL_MAX_ATTEMPTS} = JOBS_WORKER

const STATUS_ERROR = 'Error'
const STATUS_RUNNING = 'Running'
const STATUS_SUCCESS = 'Success'
const STATUS_TIMED_OUT = 'Timed Out'

const cache = {}
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
      const job = new Job({
        algorithmName,
        id,
        imageIds,
        name,
        createdOn: Date.now(),
        status: STATUS_RUNNING
      })

      cache[id] = job
      dispatchWorker(client, job)
      return id
    })
}

export function list(/*client*/) {
  return Promise.resolve(
    Object.keys(cache)
      .map(k => cache[k])
      .sort((a, b) => b.createdOn - a.createdOn)
  )
}

export function getResult(client, resultId) {
  return client.getFile(resultId).then(str => new Result(str, resultId, resultId))
}

//
// Internals
//

function dispatchWorker(client, job) {
  let attempt = 0
  const maxAttempts = POLL_MAX_ATTEMPTS
  const handle = setInterval(__poll__, POLL_INTERVAL)
  const terminate = () => clearTimeout(handle)

  function __poll__() {
    attempt += 1
    client.getStatus(job.id).then(status => {
      console.debug('(jobs.dispatchWorker) <%s> poll #%s (%s)', job.id, attempt, status.status)

      if (status.status === STATUS_SUCCESS) {
        job.status = STATUS_SUCCESS
        resolutionWorker(client, job, status)
        terminate()
      }

      else if (status.error === STATUS_ERROR) {
        job.status = STATUS_ERROR
        throw new Error(`ExecutionError: ${status.message}`)
      }

      else if (attempt >= maxAttempts) {
        job.status = STATUS_TIMED_OUT
        throw new Error(`TooManyAttempts: (max=${maxAttempts})`)
      }

    }).catch(err => {
      console.error('(jobs.dispatchWorker) <%s> Polling failed:', job.id, err)
      terminate()
    })
  }
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

function resolutionWorker(client, job, status) {
  const metadataId = status.result.dataId

  console.debug('(jobs.resolutionWorker) <%s> Fetching metadata', metadataId)

  client.getFile(metadataId).then(metadataString => {
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
    console.error('(jobs.resolutionWorker) <%s> Failed:', metadataId, err)
  })
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

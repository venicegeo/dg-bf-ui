import {API_NAMESPACE} from '../config'

const _fetch = (uri, options) => fetch(`${API_NAMESPACE}${uri}`, options)

export function fetchAlgorithms() {
  return _fetch('/algorithms')
    .then(response => response.json())
    .then(({algorithms}) => algorithms.map(a => new Algorithm(a)))
}

export function fetchJobs() {
  return _fetch('/jobs')
    .then(response => response.json())
    .then(({jobs}) => jobs
      .map(j => new Job(j))
      .sort((a, b) => b.createdOn - a.createdOn))
}

export function fetchResult(id) {
  return _fetch(`/results/${id}`)
    .then(response => response.json())
    .then(geojson => new Result(geojson, id, id))  // FIXME - API needs to return Name as well
}

export function fetchImageList() {
  return _fetch('/images')
    .then(response => response.json())
    .then(data => data.images.map(d => new ImageComposite(d)))
}

export function createJob({name, algorithmId, algorithmName, parameters}) {

  // HACK
  const image = {}
  const images = parameters.find(p => p[0] === '--image')
  if (images) {
    image.id = images[1]
  }
  // HACK

  return _fetch('/jobs', {
    body: JSON.stringify({name, algorithmId, algorithmName, image, inputs: parameters}),
    headers: {'content-type': 'application/json'},
    method: 'post'})
    .then(response => response.text())
}

//
// Data Structures
//

class Algorithm {
  constructor(raw) {
    this.id = raw.id
    this.inputs = raw.inputs.map(i => new AlgorithmInput(i))
    this.description = raw.description
    this.name = raw.name
    this.url = raw.url  // FIXME -- necessary?
  }
}

class AlgorithmInput {
  constructor(raw) {
    this.key = raw.key
    this.name = raw.name
    this.type = raw.type
  }
}

class ImageComposite {
  constructor(raw) {
    this.name = raw.name
    this.ids = raw.ids
  }
}

class Job {
  constructor(raw) {
    this.algorithm = raw.algorithmName
    this.createdOn = new Date(raw.date)  // FIXME - make less naive
    this.id = raw.id
    this.name = raw.name
    this.resultId = raw.resultId
    this.status = raw.status
  }
}

class Result {
  constructor(geojson, id, name) {
    this.geojson = geojson
    this.id = id
    this.name = name
  }
}

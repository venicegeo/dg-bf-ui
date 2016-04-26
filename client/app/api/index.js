import {API_NAMESPACE} from '../config';

const _fetch = (uri, options) => fetch(`${API_NAMESPACE}${uri}`, options);

export function fetchAlgorithms() {
  return _fetch('/algorithms')
    .then(response => response.json())
    .then(({algorithms}) => algorithms.map(a => new Algorithm(a)));
}

export function fetchJobs() {
  return _fetch('/jobs')
    .then(response => response.json())
    .then(({jobs}) => jobs
      .map(j => new Job(j))
      .sort((a, b) => b.createdOn - a.createdOn));
}

export function fetchResult(id) {
  return _fetch(`/results/${id}`)
    .then(response => response.json())
    .then(geojson => new Result(geojson, id, id));  // FIXME - API needs to return Name as well
}

export function fetchImageList() {
  // return _fetch(`/algorithm/images')
  //   .then(response => response.json())
  return new Promise(resolve => resolve({images: [
    {id: 'LC80090472014280LGN00_B3.TIF,LC80090472014280LGN00_B6.TIF', name: 'LC80090472014280LGN00'},
    {id: 'LC80150442014002LGN00_B3.TIF,LC80150442014002LGN00_B6.TIF', name: 'LC80150442014002LGN00'},
    {id: 'LC80340432016061LGN00_B3.TIF,LC80340432016061LGN00_B6.TIF', name: 'LC80340432016061LGN00'},
    {id: 'LC82010352014217LGN00_B3.TIF,LC82010352014217LGN00_B6.TIF', name: 'LC82010352014217LGN00'}
  ]}))
    .then(data => data.images.map(d => new Image(d)));
}

export function createJob({name, algorithmId, algorithmName, parameters}) {
  // const
  // const body = new FormData();
  // body.append('algorithmName', algorithmName);
  // body.append('jobName', name);
  // body.append('serviceId', algorithmId);
  // parameters.forEach(param => body.append(...param));
  return _fetch('/jobs', {
    body: JSON.stringify({name, algorithmId, algorithmName, inputs: parameters}),
    headers: {'content-type': 'application/json'},
    method: 'post'})
    .then(response => response.json());
}

//
// Data Structures
//

class Algorithm {
  constructor(raw) {
    this.id = raw.id;
    this.inputs = raw.inputs.map(i => new AlgorithmInput(i));
    this.description = raw.description;
    this.name = raw.name;
    this.url = raw.url;  // FIXME -- necessary?
  }
}

class AlgorithmInput {
  constructor(raw) {
    this.key = raw.key;
    this.name = raw.name;
    this.type = raw.type;
  }
}

class Image {
  constructor(raw) {
    this.id = raw.id;
    this.name = raw.name;
  }
}

class Job {
  constructor(raw) {
    this.algorithm = raw.algorithmName;
    this.createdOn = new Date(raw.date);  // FIXME - make less naive
    this.id = raw.id;
    this.name = raw.name;
    this.resultId = raw.resultId;
    this.status = raw.status;
  }
}

class Result {
  constructor(geojson, id, name) {
    this.geojson = geojson;
    this.id = id;
    this.name = name;
  }
}

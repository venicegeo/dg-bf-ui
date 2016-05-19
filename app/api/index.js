import {Client} from './piazza-client'
import * as algorithms from './algorithms'
import * as jobs from './jobs'
import * as imagery from './imagery'
import {GATEWAY} from '../config'

// HACK HACK HACK HACK HACK HACK HACK HACK
let authToken = sessionStorage.getItem('authToken')
if (!authToken) {
  authToken = prompt('Authorization:')  // eslint-disable-line
  sessionStorage.setItem('authToken', authToken)
}
const client = new Client(GATEWAY, authToken)
// HACK HACK HACK HACK HACK HACK HACK HACK

export function fetchAlgorithms() {
  return algorithms.list(client)
}

export function fetchJobs() {
  return jobs.list(client)
}

export function fetchResult(id) {
  return jobs.getResult(client, id)
}

export function fetchImageList() {
  return imagery.list(client)
}

export function createJob({name, algorithmId, algorithmName, imageIds}) {
  return jobs.execute(client, {name, algorithmId, algorithmName, imageIds})
}

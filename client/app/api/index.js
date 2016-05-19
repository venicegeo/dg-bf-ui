import {Client} from './piazza-client'
import * as algorithms from './algorithms'
import * as jobs from './jobs'
import * as imagery from './imagery'
import {GATEWAY} from '../config'

const client = new Client(GATEWAY, 'auth token placeholder')

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

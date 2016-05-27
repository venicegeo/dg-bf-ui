import {Client} from './piazza-client'
import * as algorithms from './algorithms'
import * as jobs from './jobs'
import * as imagery from './imagery'
import * as authentication from './auth'
import {GATEWAY} from '../config'

let client

export function login(username, password) {
  return authentication.login(GATEWAY, username, password)
    .then(initializeSubmodules)
}

export function isLoggedIn() {
  return !!authentication.getAuthToken()
}

export function fetchAlgorithms() {
  return algorithms.list(client)
}

export function fetchJobs() {
  return jobs.list()
}

export function fetchResult(id, progress) {
  return jobs.getResult(client, id, progress)
}

export function fetchImageList() {
  return imagery.list(client)
}

export function createJob({name, algorithmId, algorithmName, imageIds}) {
  return jobs.execute(client, {name, algorithmId, algorithmName, imageIds})
}

//
// Internals
//

function initialize() {
  const token = authentication.getAuthToken()
  if (token) {
    initializeSubmodules(token)
  }
}

function initializeSubmodules(authToken) {
  client = new Client(GATEWAY, authToken)
  jobs.initialize(client)
}

//
// Bootstrapping
//

initialize()

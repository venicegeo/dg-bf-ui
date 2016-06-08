import {Client} from '../utils/piazza-client'
import {GATEWAY} from '../config'

//
// Action Types
//

export const LOAD_RESULT = 'LOAD_RESULT'
export const LOAD_RESULT_SUCCESS = 'LOAD_RESULT_SUCCESS'
export const LOAD_RESULT_ERROR = 'LOAD_RESULT_ERROR'
export const LOAD_RESULT_PROGRESSED = 'LOAD_RESULT_PROGRESSED'
export const UNLOAD_RESULT = 'UNLOAD_RESULT'

//
// Action Creators
//

export function changeLoadedResults(ids = []) {
  return (dispatch, getState) => {
    const {results, jobs} = getState()
    const promises = jobs.records.filter(job => job.resultId).map(job => {
      const shouldLoad = ids.indexOf(job.id) !== -1
      const isLoadedOrLoading = results[job.id]

      if (shouldLoad && isLoadedOrLoading) {
        return  // Nothing to do
      }

      if (!shouldLoad && isLoadedOrLoading) {
        return dispatch(unloadResult(job.id))  // TODO -- cancel any in-flight promises
      }

      if (shouldLoad && !isLoadedOrLoading) {
        return dispatch(loadResult(job.id, job.resultId))
      }
    })
    return Promise.all(promises)
  }
}

export function downloadResult(jobId) {
  return (dispatch, getState) => {
    const job = getState().jobs.records.find(j => j.id === jobId)
    if (!job) {
      console.error('Job <%s> does not exist', jobId)
      return
    }
    return dispatch(loadResult(job.id, job.resultId))
  }
}

function loadResult(jobId, resultId) {
  return (dispatch, getState) => {
    const state = getState()
    const client = new Client(GATEWAY, state.login.authToken)

    if (state.results[jobId]) {
      console.debug('(results:loadResult) cache hit: <%s>', jobId)
      return  // Already loading or loaded
    }

    console.debug('(results:loadResult) cache miss: <%s>', jobId)
    dispatch({
      type: LOAD_RESULT,
      jobId
    })

    const cached = readCached(jobId)
    if (cached) {
      dispatch(loadResultSuccess(jobId, cached))
      return
    }

    return client.getFile(resultId, (loaded, total) => {
      dispatch(loadResultProgressed(jobId, loaded, total))
    })
      .then(str => {
        writeCache(jobId, str)
        dispatch(loadResultSuccess(jobId, str))
      })
      .catch(err => {
        dispatch(loadResultError(jobId, err))
      })
  }
}

function loadResultError(jobId, err) {
  return {
    type: LOAD_RESULT_ERROR,
    jobId,
    message: err.toString()
  }
}

function loadResultProgressed(jobId, loaded, total) {
  return {
    type: LOAD_RESULT_PROGRESSED,
    jobId,
    loaded,
    total
  }
}

function loadResultSuccess(jobId, str) {
  return {
    type: LOAD_RESULT_SUCCESS,
    jobId,
    geojson: str
  }
}

function unloadResult(jobId) {
  return {
    type: UNLOAD_RESULT,
    jobId
  }
}

//
// Internals
//

function writeCache(jobId, geojsonString) {
  localStorage.setItem(`result:${jobId}`, geojsonString)
}

function readCached(jobId) {
  return localStorage.getItem(`result:${jobId}`)
}

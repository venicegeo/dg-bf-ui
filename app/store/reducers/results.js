import {
  LOAD_RESULT,
  LOAD_RESULT_SUCCESS,
  LOAD_RESULT_ERROR,
  LOAD_RESULT_PROGRESSED,
  UNLOAD_RESULT
} from '../../actions/results'

export function reducer(state = {}, action) {
  const {jobId} = action
  switch (action.type) {
  case LOAD_RESULT:
    return {
      ...state,
      [jobId]: {
        loading: true
      }
    }
  case LOAD_RESULT_SUCCESS:
    return {
      ...state, [jobId]: {
        ...state[jobId],
        loading: false,
        geojson: action.geojson
      }
    }
  case LOAD_RESULT_ERROR:
    return {
      ...state, [jobId]: {
        ...state[jobId],
        loading: false,
        error: action.err
      }
    }
  case LOAD_RESULT_PROGRESSED:
    return {
      ...state, [jobId]: {
        ...state[jobId],
        progress: {
          loaded: action.loaded,
          total: action.total
        }
      }
    }
  case UNLOAD_RESULT:
    return {
      ...state, [jobId]: undefined
    }
  default:
    return state
  }
}

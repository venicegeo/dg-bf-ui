import {
  ALGORITHMS_WORKER_ERROR,
  START_ALGORITHMS_WORKER,
  STOP_ALGORITHMS_WORKER,
} from '../../actions/algorithms'
import {
  JOBS_WORKER_ERROR,
  START_JOBS_WORKER,
  STOP_JOBS_WORKER,
} from '../../actions/jobs'

export function reducer(state = {
  algorithms: {
    running: false,
    error: null
  },
  jobs: {
    running: false,
    error: null
  }
}, action) {
  switch (action.type) {
  case ALGORITHMS_WORKER_ERROR:
    return {
      ...state,
      algorithms: {
        ...state.algorithms,
        error: action.err
      }
    }
  case START_ALGORITHMS_WORKER:
    return {
      ...state,
      algorithms: {
        running: true,
        error: null
      }
    }
  case STOP_ALGORITHMS_WORKER:
    return {
      ...state,
      algorithms: {
        ...state.algorithms,
        running: false
      }
    }
  case JOBS_WORKER_ERROR:
    return {
      ...state,
      jobs: {
        ...state.jobs,
        error: action.err
      }
    }
  case START_JOBS_WORKER:
    return {
      ...state,
      jobs: {
        running: true,
        error: null
      }
    }
  case STOP_JOBS_WORKER:
    return {
      ...state,
      jobs: {
        ...state.jobs,
        running: false
      }
    }
  default:
    return state
  }
}

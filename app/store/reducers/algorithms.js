import {
  FETCH_ALGORITHMS,
  FETCH_ALGORITHMS_SUCCESS,
} from '../../actions/algorithms'

export function reducer(state = {
  fetching: false,
  records: []
}, action) {
  switch (action.type) {
  case FETCH_ALGORITHMS:
    return {
      ...state,
      fetching: true
    }
  case FETCH_ALGORITHMS_SUCCESS:
    return {
      ...state,
      fetching: false,
      records: action.records
    }
  default:
    return state
  }
}

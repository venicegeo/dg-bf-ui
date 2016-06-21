import {
  AUTHENTICATE,
  AUTHENTICATE_SUCCESS,
  AUTHENTICATE_ERROR,
} from '../../actions/authentication'

const INITIAL_STATE = {
  authenticating: false,
  error: null,
  token: null
}

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case AUTHENTICATE:
    return {
      ...state,
      authenticating: true
    }
  case AUTHENTICATE_SUCCESS:
    return {
      ...state,
      authenticating: false,
      error:          null,
      token:          action.token
    }
  case AUTHENTICATE_ERROR:
    return {
      ...state,
      authenticating: false,
      error:          action.err,
      token:          null
    }
  default:
    return state
  }
}

export function deserialize() {
  return {
    ...INITIAL_STATE,
    ...JSON.parse(sessionStorage.getItem('authentication')),
  }
}

export function serialize(state) {
  sessionStorage.setItem('authentication', JSON.stringify({
    token: state.token
  }))
}

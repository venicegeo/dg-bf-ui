import moment from 'moment'
import {CATALOG} from '../config'

//
// Action Types
//

export const CLEAR_IMAGE_SEARCH_RESULTS = 'CLEAR_IMAGE_SEARCH_RESULTS'
export const SEARCH_IMAGE_CATALOG = 'SEARCH_IMAGE_CATALOG'
export const SEARCH_IMAGE_CATALOG_SUCCESS = 'SEARCH_IMAGE_CATALOG_SUCCESS'
export const SEARCH_IMAGE_CATALOG_ERROR = 'SEARCH_IMAGE_CATALOG_ERROR'
export const SELECT_IMAGE = 'SELECT_IMAGE'

//
// Action Creators
//

export function clearImageSearchResults() {
  return {
    type: CLEAR_IMAGE_SEARCH_RESULTS
  }
}

export function selectImage(feature) {
  return {
    type: SELECT_IMAGE,
    feature
  }
}

export function searchImageCatalog(apiKey, bbox, dateFrom /*, dateTo*/) {
  return (dispatch) => {
    dispatch({
      type: SEARCH_IMAGE_CATALOG
    })

    const acquiredDate = moment(dateFrom).toISOString()
    return fetch(`${CATALOG}/discover?acquiredDate=${acquiredDate}&bbox=${bbox}&cloudCover=0.1`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('HTTP Error ' + response.status)
      })
      .then(results => {
        dispatch(searchImageCatalogSuccess(results))
      })
      .catch(err => {
        dispatch(searchImageCatalogError(err))
      })
  }
}

//
// Internals
//

function searchImageCatalogError(err) {
  return {
    type: SEARCH_IMAGE_CATALOG_ERROR,
    err
  }
}

function searchImageCatalogSuccess(results) {
  return {
    type: SEARCH_IMAGE_CATALOG_SUCCESS,
    results
  }
}

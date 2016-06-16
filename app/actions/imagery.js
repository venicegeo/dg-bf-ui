/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

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
export const UPDATE_IMAGE_SEARCH_BBOX = 'UPDATE_IMAGE_SEARCH_BBOX'
export const UPDATE_IMAGE_SEARCH_DATES = 'UPDATE_IMAGE_SEARCH_DATES'
export const UPDATE_IMAGE_CATALOG_API_KEY = 'UPDATE_IMAGE_CATALOG_API_KEY'

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

export function searchImageCatalog(startIndex=0, count=100) {
  return (dispatch, getState) => {
    dispatch({
      type: SEARCH_IMAGE_CATALOG
    })

    const {bbox, dateFrom} = getState().imagery.search.criteria
    const acquiredDate = moment(dateFrom).toISOString()
    return fetch(`${CATALOG}/discover?acquiredDate=${acquiredDate}&bbox=${bbox}&cloudCover=0.1&count=${count}&startIndex=${startIndex}`)
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

export function updateImageryCatalogApiKey(value) {
  return {
    type: UPDATE_IMAGE_CATALOG_API_KEY,
    value
  }
}

export function updateImageSearchBbox(bbox) {
  return {
    type: UPDATE_IMAGE_SEARCH_BBOX,
    bbox: bbox || null
  }
}

export function updateImageSearchDates(dateFrom, dateTo) {
  return {
    type: UPDATE_IMAGE_SEARCH_DATES,
    dateFrom,
    dateTo
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

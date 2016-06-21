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

export const SEARCH_CATALOG = 'SEARCH_CATALOG'
export const SEARCH_CATALOG_SUCCESS = 'SEARCH_CATALOG_SUCCESS'
export const SEARCH_CATALOG_ERROR = 'SEARCH_CATALOG_ERROR'
export const UPDATE_SEARCH_BBOX = 'UPDATE_SEARCH_BBOX'
export const UPDATE_SEARCH_DATES = 'UPDATE_SEARCH_DATES'

export function searchCatalog(startIndex = 0, count = 100) {
  return (dispatch, getState) => {
    dispatch({
      type: SEARCH_CATALOG
    })

    const state = getState()
    const {bbox, dateFrom} = state.search
    const catalogUrl = state.catalog.url
    const acquiredDate = moment(dateFrom).toISOString()
    return fetch(`${catalogUrl}/discover?acquiredDate=${acquiredDate}&bbox=${bbox}&cloudCover=10&count=${count}&startIndex=${startIndex}`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('HTTP Error ' + response.status)
      })
      .then(results => {
        dispatch(searchCatalogSuccess(results))
      })
      .catch(err => {
        dispatch(searchCatalogError(err))
      })
  }
}

export function updateSearchBbox(bbox) {
  return {
    type: UPDATE_SEARCH_BBOX,
    bbox: bbox || null
  }
}

export function updateSearchDates(dateFrom, dateTo) {
  return {
    type: UPDATE_SEARCH_DATES,
    dateFrom,
    dateTo
  }
}

function searchCatalogError(err) {
  return {
    type: SEARCH_CATALOG_ERROR,
    err
  }
}

function searchCatalogSuccess(results) {
  return {
    type: SEARCH_CATALOG_SUCCESS,
    results
  }
}

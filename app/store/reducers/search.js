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

import {
  SEARCH_CATALOG,
  SEARCH_CATALOG_ERROR,
  SEARCH_CATALOG_SUCCESS,
  UPDATE_SEARCH_BBOX,
  UPDATE_SEARCH_CLOUDCOVER,
  UPDATE_SEARCH_DATES,
  UPDATE_SEARCH_FILTER,
} from '../../actions/search'

import {
  DISCOVER_CATALOG_SUCCESS,
} from '../../actions/catalog'

const INITIAL_STATE = {
  bbox:       null,
  cloudCover: 10,
  dateFrom:   moment().subtract(30, 'days').format('YYYY-MM-DD'),
  dateTo:     moment().format('YYYY-MM-DD'),
  searching:  false,
  filter:     null,
  error:      null
}

export function reducer(state = null, action) {
  switch (action.type) {
  case UPDATE_SEARCH_BBOX:
    return {
      ...state,
      bbox: action.bbox,
    }
  case UPDATE_SEARCH_CLOUDCOVER:
    return {
      ...state,
      cloudCover: action.cloudCover,
    }
  case UPDATE_SEARCH_DATES:
    return {
      ...state,
      dateFrom: action.dateFrom,
      dateTo:   action.dateTo,
    }
  case DISCOVER_CATALOG_SUCCESS:
    const coastlineFilter = action.filters.find(f => /(shore|coast)line/i.test(f.name))
    return {
      ...state,
      filter: coastlineFilter ? coastlineFilter.id : INITIAL_STATE.filter,
    }
  case UPDATE_SEARCH_FILTER:
    return {
      ...state,
      filter: action.filter,
    }
  case SEARCH_CATALOG:
    return {
      ...state,
      searching: true,
    }
  case SEARCH_CATALOG_SUCCESS:
    return {
      ...state,
      error:     null,
      searching: false,
    }
  case SEARCH_CATALOG_ERROR:
    return {
      ...state,
      error:     action.err,
      searching: false,
    }
  default:
    return state
  }
}

export function deserialize() {
  return {
    ...INITIAL_STATE,
    ...JSON.parse(sessionStorage.getItem('search'))
  }
}

export function serialize(state) {
  sessionStorage.setItem('search', JSON.stringify({
    bbox:       state.bbox,
    cloudCover: state.cloudCover,
    dateFrom:   state.dateFrom,
    dateTo:     state.dateTo,
    filter:     state.filter,
  }))
}

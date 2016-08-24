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

//
// Action Types
//

export const CHANGE_JOB_NAME = 'CHANGE_JOB_NAME'
export const SELECT_IMAGE = 'SELECT_IMAGE'
export const CLEAR_SELECTED_IMAGE = 'CLEAR_SELECTED_IMAGE'

//
// Action Creators
//

export function resetJobName() {
  return {
    type: CHANGE_JOB_NAME,
    name: 'BF_' + moment().format('DDMMMYYYY').toUpperCase()
  }
}

export function changeJobName(name) {
  return {
    type: CHANGE_JOB_NAME,
    name
  }
}

export function selectImage(feature) {
  return {
    type: SELECT_IMAGE,
    feature
  }
}

export function clearSelectedImage() {
  return {
    type: CLEAR_SELECTED_IMAGE,
  }
}

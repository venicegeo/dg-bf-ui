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

import React from 'react'
import {mount} from 'enzyme'
import expect from 'expect'
import PrimaryMap from 'app/components/PrimaryMap'

describe('<PrimaryMap/>', () => {
  let _props

  beforeEach(() => {
    _props = {}
  })

  it('renders')
  it('can create a map instance')

  describe('anchor', () => {
    it('recenters map when anchor prop changes')
    it('doesnt reverberate `onAnchorChange` events')
  })

  describe('bbox', () => {
    it('can render bbox')
    it('doesnt reverberate `onBoundingBoxChange` event')
  })

  describe('catalogApiKey', () => {
    it('sends correct catalog API key via XYZ')
  })

  describe('detections', () => {
    it('sends correct layer IDs to WMS server')
  })

  describe('frames', () => {
    it('renders job frames')
    it('renders bounding box')
    it('renders product line frames')
  })

  describe('geoserverUrl', () => {
    it('uses correct geoserver URL')
    it('talks to geoserver via WMS')
  })

  describe('highlightedFeature', () => {
    it('recenters map when anchor prop changes')
    it('doesnt reverberate `onHoverFeature` event')
  })

  describe('imagery', () => {
    it('renders imagery search result footprints')
  })

  describe('mode', () => {
    it('activates correct interactions when mode changes from X to Y')
    it('clears imagery when mode changes')
    it('clears jobs when mode changes')
    it('clears product lines when mode changes')
  })

  describe('selectedFeature', () => {
    it('recenters map when anchor prop changes')
    it('doesnt reverberate `onSelectImage` event')
    it('doesnt reverberate `onSelectJob` event')
  })

  describe('eventing', () => {
    it('emits `onAnchorChange` event')
    it('emits `onBoundingBoxChange` event')
    it('emits `onSelectImage` event')
    it('emits `onSelectJob` event')
    it('emits `onSearchPageChange` event')
  })
})

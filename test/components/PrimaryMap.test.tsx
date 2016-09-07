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

import * as React from 'react'
import * as ol from 'openlayers'
import {mount} from 'enzyme'
import {assert} from 'chai'
import * as sinon from 'sinon'
import {
  PrimaryMap,
  MODE_NORMAL,
} from '../../app/components/PrimaryMap'

interface Internals {
  detectionsLayer: ol.layer.Tile
  drawLayer: ol.layer.Vector
  map: ol.Map
  previewLayers: {[key: string]: ol.layer.Tile}
}

describe('<PrimaryMap/>', () => {
  let _props

  beforeEach(() => {
    _props = {
      bbox:                null,
      catalogApiKey:       '',
      detections:          [],
      frames:              [],
      geoserverUrl:        'http://test-geoserver-url',
      highlightedFeature:  null,
      imagery:             null,
      isSearching:         false,
      mode:                MODE_NORMAL,
      selectedFeature:     null,
      onBoundingBoxChange: sinon.stub(),
      onSearchPageChange:  sinon.stub(),
      onSelectFeature:     sinon.stub(),
      onViewChange:        sinon.stub(),
    }
  })

  it('renders', () => {
    const wrapper = mount(
      <PrimaryMap
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        detections={_props.detections}
        frames={_props.frames}
        geoserverUrl={_props.geoserverUrl}
        highlightedFeature={_props.highlightedFeature}
        imagery={_props.imagery}
        isSearching={_props.isSearching}
        mode={_props.mode}
        selectedFeature={_props.selectedFeature}
        view={_props.view}
        onBoundingBoxChange={_props.onBoundingBoxChange}
        onSearchPageChange={_props.onSearchPageChange}
        onSelectFeature={_props.onSelectFeature}
        onViewChange={_props.onViewChange}
      />
    )
    assert.equal(wrapper.find('.PrimaryMap-root').length, 1)
    assert.equal(wrapper.find('.PrimaryMap-basemapSelect').length, 1)
  })

  it('creates a map instance', () => {
    const wrapper = mount(
      <PrimaryMap
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        detections={_props.detections}
        frames={_props.frames}
        geoserverUrl={_props.geoserverUrl}
        highlightedFeature={_props.highlightedFeature}
        imagery={_props.imagery}
        isSearching={_props.isSearching}
        mode={_props.mode}
        selectedFeature={_props.selectedFeature}
        view={_props.view}
        onBoundingBoxChange={_props.onBoundingBoxChange}
        onSearchPageChange={_props.onSearchPageChange}
        onSelectFeature={_props.onSelectFeature}
        onViewChange={_props.onViewChange}
      />
    )
    assert.instanceOf((wrapper.instance() as any as Internals).map, ol.Map)
    assert.instanceOf((wrapper.ref('container') as any).node.querySelector('canvas'), HTMLCanvasElement)
  })

  describe('view', () => {
    const getComponent = (view) => mount(
      <PrimaryMap
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        detections={_props.detections}
        frames={_props.frames}
        geoserverUrl={_props.geoserverUrl}
        highlightedFeature={_props.highlightedFeature}
        imagery={_props.imagery}
        isSearching={_props.isSearching}
        mode={_props.mode}
        selectedFeature={_props.selectedFeature}
        view={view}
        onBoundingBoxChange={_props.onBoundingBoxChange}
        onSearchPageChange={_props.onSearchPageChange}
        onSelectFeature={_props.onSelectFeature}
        onViewChange={_props.onViewChange}
      />
    )

    it('has correct center on init', () => {
      const wrapper = getComponent({ basemapIndex: 0, center: [0, 0], zoom: 5.5 })
      return awaitMap(() => {
        const view = (wrapper.instance() as any as Internals).map.getView()
        assert.deepEqual(ol.proj.toLonLat(view.getCenter()), [0, 0])
      })
    })

    it('has correct zoom on init', () => {
      const wrapper = getComponent({ basemapIndex: 0, center: [0, 0], zoom: 5.5 })
      return awaitMap(() => {
        const view = (wrapper.instance() as any as Internals).map.getView()
        assert.equal(view.getZoom(), 5.5)
      })
    })

    it('has correct basemap on init', () => {
      const wrapper = getComponent({ basemapIndex: 0, center: [0, 0], zoom: 5.5 })
      return awaitMap(() => {
        assert.equal(wrapper.state('basemapIndex'), 0)
      })
    })

    it('recenters map when `view` prop changes', () => {
      const wrapper = getComponent({ basemapIndex: 0, center: [0, 0], zoom: 5.5 })
      wrapper.setProps({ view: { basemapIndex: 0, center: [30, 30], zoom: 5.5 } })
      return awaitMap(() => {
        const view = (wrapper.instance() as any as Internals).map.getView()
        assert.deepEqual(ol.proj.toLonLat(view.getCenter()).map(Math.round), [30, 30])
      })
    })

    it('changes zoom when `view` prop changes', () => {
      const wrapper = getComponent({ basemapIndex: 0, center: [0, 0], zoom: 5.5 })
      wrapper.setProps({ view: { basemapIndex: 0, center: [0, 0], zoom: 10.5 } })
      return awaitMap(() => {
        const view = (wrapper.instance() as any as Internals).map.getView()
        assert.equal(view.getZoom(), 10.5)
      })
    })

    it('changes basemap when `view` prop changes', () => {
      const wrapper = getComponent({ basemapIndex: 0, center: [0, 0], zoom: 5.5 })
      wrapper.setProps({ view: { basemapIndex: 2, center: [0, 0], zoom: 5.5 } })
      return awaitMap(() => {
        assert.equal(wrapper.state('basemapIndex'), 2)
      })
    })

    it('doesnt reverberate `onViewChange` events', () => {
      const wrapper = getComponent({ basemapIndex: 0, center: [0, 0], zoom: 5.5 })
      wrapper.setProps({ view: { basemapIndex: 2, center: [30, 30], zoom: 10.5 } })
      return awaitMap(() => {
        assert.isFalse(wrapper.prop('onViewChange').called)
      }, 300)  // wait for debounce to complete
    })
  })

  describe('bbox', () => {
    const getComponent = (bbox) => mount(
      <PrimaryMap
        bbox={bbox}
        catalogApiKey={_props.catalogApiKey}
        detections={_props.detections}
        frames={_props.frames}
        geoserverUrl={_props.geoserverUrl}
        highlightedFeature={_props.highlightedFeature}
        imagery={_props.imagery}
        isSearching={_props.isSearching}
        mode={_props.mode}
        selectedFeature={_props.selectedFeature}
        view={_props.view}
        onBoundingBoxChange={_props.onBoundingBoxChange}
        onSearchPageChange={_props.onSearchPageChange}
        onSelectFeature={_props.onSelectFeature}
        onViewChange={_props.onViewChange}
      />
    )

    it('can render bbox', () => {
      const wrapper = getComponent([0, 0, 30, 30])
      return awaitMap(() => {
        const layerSource = (wrapper.instance() as any as Internals).drawLayer.getSource()
        const features = layerSource.getFeatures()
        const points = (features[0].getGeometry() as ol.geom.Polygon).getCoordinates()[0].map(p => ol.proj.toLonLat(p).map(Math.round))
        assert.equal(features.length, 1)
        assert.deepEqual(points, [[0, 0], [0, 30], [30, 30], [30, 0], [0, 0]])
      }, 0)
    })

    it('redraws bbox when `bbox` prop changes', () => {
      const wrapper = getComponent([0, 0, 30, 30])
      wrapper.setProps({ bbox: [-30, -30, 0, 0] })
      return awaitMap(() => {
        const layerSource = (wrapper.instance() as any as Internals).drawLayer.getSource()
        const features = layerSource.getFeatures()
        const points = (features[0].getGeometry() as ol.geom.Polygon).getCoordinates()[0].map(p => ol.proj.toLonLat(p).map(Math.round))
        assert.equal(features.length, 1)
        assert.deepEqual(points, [[-30, -30], [-30, 0], [0, 0], [0, -30], [-30, -30]])
      }, 0)
    })

    it('doesnt reverberate `onBoundingBoxChange` event', () => {
      const wrapper = getComponent([0, 0, 30, 30])
      // awaitMap(() => {
      wrapper.setProps({ bbox: [-30, -30, 0, 0] })
      // }, 0)
      return awaitMap(() => {
        assert.isTrue(wrapper.prop('onBoundingBoxChange').notCalled)
      })
    })
  })

  describe('catalogApiKey', () => {
    const getComponent = (catalogApiKey) => mount(
      <PrimaryMap
        bbox={_props.bbox}
        catalogApiKey={catalogApiKey}
        detections={_props.detections}
        frames={_props.frames}
        geoserverUrl={_props.geoserverUrl}
        highlightedFeature={_props.highlightedFeature}
        imagery={_props.imagery}
        isSearching={_props.isSearching}
        mode={_props.mode}
        selectedFeature={generateScene()}
        view={_props.view}
        onBoundingBoxChange={_props.onBoundingBoxChange}
        onSearchPageChange={_props.onSearchPageChange}
        onSelectFeature={_props.onSelectFeature}
        onViewChange={_props.onViewChange}
      />
    )

    it('sends correct catalog API key via XYZ', () => {
      const wrapper = getComponent('test-catalog-api-key')
      const sceneId = wrapper.prop('selectedFeature').id
      const urls = ((wrapper.instance() as any as Internals).previewLayers[sceneId].getSource() as ol.source.TileWMS).getUrls()
      assert.isTrue(urls.every(s => s.includes('test-catalog-api-key')))
    })
  })

  describe('detections', () => {
    const getComponent = (detections) => mount(
      <PrimaryMap
        bbox={_props.bbox}
        catalogApiKey={_props.catalogApiKey}
        detections={detections}
        frames={_props.frames}
        geoserverUrl={_props.geoserverUrl}
        highlightedFeature={_props.highlightedFeature}
        imagery={_props.imagery}
        isSearching={_props.isSearching}
        mode={_props.mode}
        selectedFeature={generateScene()}
        view={_props.view}
        onBoundingBoxChange={_props.onBoundingBoxChange}
        onSearchPageChange={_props.onSearchPageChange}
        onSelectFeature={_props.onSelectFeature}
        onViewChange={_props.onViewChange}
      />
    )

    it('sends correct layer IDs to WMS server (single)', () => {
      const wrapper = getComponent([generateCompletedJob()])
      const source = (wrapper.instance() as any as Internals).detectionsLayer.getSource() as ol.source.TileWMS
      assert.deepEqual(source.getParams(), {LAYERS: 'test-data-id'})
    })

    it('sends correct layer IDs to WMS server (multiple)', () => {
      const wrapper = getComponent([
        generateCompletedJob('job-1', 'test-data-id-1'),
        generateCompletedJob('job-2', 'test-data-id-2'),
        generateCompletedJob('job-3', 'test-data-id-3'),
      ])
      const source = (wrapper.instance() as any as Internals).detectionsLayer.getSource() as ol.source.TileWMS
      assert.deepEqual(source.getParams(), {LAYERS: 'test-data-id-1,test-data-id-2,test-data-id-3'})
    })

    it('set appropriate bbox for layer (single)', () => {
      const wrapper = getComponent([generateCompletedJob()])
      assert.deepEqual(layerExtent((wrapper.instance() as any as Internals).detectionsLayer), [114, -31, 117, -29])
    })

    it('sets appropriate bbox for layer (multiple)', () => {
      const job1 = generateCompletedJob('job-1', 'test-data-id-1')
      const job2 = generateCompletedJob('job-2', 'test-data-id-2')
      const job3 = generateCompletedJob('job-3', 'test-data-id-3')
      job1.geometry.coordinates = [[[0, 0], [0, 30], [30, 30], [30, 0], [0, 0]]]
      job2.geometry.coordinates = [[[-10, 35], [-10, 25], [0, 25], [0, 35], [-10, 35]]]
      job3.geometry.coordinates = [[[-30, -30], [-30, 0], [0, 0], [0, -30], [-30, -30]]]
      const wrapper = getComponent([job1, job2, job3])
      assert.deepEqual(layerExtent((wrapper.instance() as any as Internals).detectionsLayer), [-30, -30, 30, 35])
    })
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
    it('renders preview layer')
    it('can select frame')
    it('can select scene footprint')
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

  describe('UX affordances', () => {
    it('show loading indicator while detections layer (WMS) is loading')
    it('show loading indicator while scene preview layer (XYZ) is loading')
    it('show error message if detections layer (WMS) fails to load')
    it('show error message if scene preview layer (XYZ) fails to load')
  })
})

//
// Helpers
//

/**
 * Gives OpenLayers enough time to complete its composition cycle after some
 * change or event.
 *
 * @param func {Function}
 * @param delay {number}
 */
function awaitMap(func, delay = 150) {
  return new Promise(resolve => setTimeout(resolve, delay)).then(func)
}

function layerExtent(layer) {
  return ol.proj.transformExtent(layer.getExtent(), 'EPSG:3857', 'EPSG:4326').map(Math.round)
}

function generateCompletedJob(jobId?, dataId = 'test-data-id') {
  const job = generateRunningJob(jobId)
  job.properties.status = 'Success'
  job.properties.detectionsDataId = dataId
  job.properties.detectionsLayerId = dataId
  return job
}

function generateRunningJob(id = 'test-job-id'): beachfront.Job {
  /* tslint:disable */
  return {
    "id": id,
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            114.746519005239,
            -29.256280009726098
          ],
          [
            116.637980889281,
            -29.6294833859327
          ],
          [
            116.201612155345,
            -31.35656771612142
          ],
          [
            114.276617762313,
            -30.9749163181228
          ],
          [
            114.746519005239,
            -29.256280009726098
          ]
        ]
      ]
    },
    "properties": {
      "algorithmName": "BF_Algo_NDWI",
      "createdOn": "2016-08-19T22:41:27.713Z",
      "detectionsDataId": null,
      "detectionsLayerId": null,
      "sceneCaptureDate": "2016-07-01T02:11:05.604Z",
      "sceneCloudCover": 10,
      "sceneId": "landsat:LC81130812016183LGN00",
      "sceneSensorName": "Landsat8",
      "name": "BF_19AUG2016",
      "status": "Running",
      "type": "JOB",
      "__schemaVersion__": 3,
    },
    "type": "Feature"
  }
  /* tslint:enable */
}

function generateScene(): beachfront.Scene {
  /* tslint:disable */
  return {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            115.245420231654,
            6.82770182318587
          ],
          [
            116.88789826004,
            6.47835671722537
          ],
          [
            116.512213662367,
            4.73558145738235
          ],
          [
            114.875734640415,
            5.09022386615981
          ],
          [
            115.245420231654,
            6.82770182318587
          ]
        ]
      ]
    },
    "properties": {
      "acquiredDate": "2016-07-04T02:32:03.014451+00:00",
      "bands": {
        "blue": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B2.TIF",
        "cirrus": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B9.TIF",
        "coastal": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B1.TIF",
        "green": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B3.TIF",
        "nir": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B5.TIF",
        "panchromatic": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B8.TIF",
        "red": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B4.TIF",
        "swir1": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B6.TIF",
        "swir2": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B7.TIF",
        "tirs1": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B10.TIF",
        "tirs2": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_B11.TIF"
      },
      "cloudCover": 11.11,
      "path": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/index.html",
      "resolution": 30,
      "sensorName": "Landsat8",
      "thumb_large": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_thumb_large.jpg",
      "thumb_small": "https://landsat-pds.s3.amazonaws.com/L8/118/056/LC81180562016186LGN00/LC81180562016186LGN00_thumb_small.jpg",
      "type": "SCENE",
    },
    "id": "landsat:LC81180562016186LGN00",
    "bbox": [
      114.875734640415,
      4.73558145738235,
      116.88789826004,
      6.82770182318587
    ]
  }
  /* tslint:enable */
}

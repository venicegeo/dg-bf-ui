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

declare namespace beachfront {
  namespace _ {
    interface ProductLineProperties {
      algorithm_name: string
      category: string
      created_by: string
      created_on: string
      max_cloud_cover: number
      name: string
      owned_by: string
      spatial_filter_id: string
      status: string
      start_on: string
      stop_on: string
      type: 'PRODUCT_LINE'
    }

    interface JobProperties {
      algorithm_name: string
      created_on: string
      name: string
      scene_time_of_collect: string
      scene_id: string
      scene_sensor_name: string
      status: string
      type: 'JOB'
    }
  }

  interface Algorithm {
    description: string
    id: string
    maxCloudCover: number
    name: string
    type: string
  }

  interface Job extends GeoJSON.Feature<GeoJSON.Polygon> {
    id: string
    properties: _.JobProperties
  }

  interface ProductLine extends GeoJSON.Feature<GeoJSON.Polygon> {
    id: string
    properties: _.ProductLineProperties
  }

  interface Scene extends GeoJSON.Feature<GeoJSON.Polygon> {
    id: string
    properties: SceneMetadata
  }

  interface SceneMetadata {
    type: 'SCENE'
    acquiredDate: string
    cloudCover: number
    resolution: number
    sensorName: string
  }

  interface ImageryCatalogPage {
    count: number
    startIndex: number
    totalCount: number
    images: GeoJSON.FeatureCollection<any>
  }
}

//
// Misc Interop
//

// Interop: Webpack

interface BuildEnvironment {
  NODE_ENV: string
  API_ROOT: string
}

declare const process: {
  env: BuildEnvironment,
}

declare const require: {
  (path: string)
  context(path: string, recursive: boolean, pattern?: RegExp): {
    keys(): string[]
    (...v: any[]),
  },
}

// Interop: core-js

interface String {
  includes(value: any, fromIndex?: number): boolean
}

interface Array<T> {
  includes(value: any, fromIndex?: number): boolean
}

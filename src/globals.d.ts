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
  namespace x {
    interface ProductLineProperties {
      algorithmName: string
      createdOn: string
      detectionsLayerId: string
      eventTypeId: string
      expiresOn: string
      name: string
      owner: string
      sceneCloudCover: number
      sceneSensorName: string
      spatialFilterName: string
      startsOn: string
      status: string
      type: 'PRODUCT_LINE'
    }

    interface JobProperties {
      __schemaVersion__: number
      algorithmName: string
      createdOn: string
      detectionsDataId: string
      detectionsLayerId: string
      name: string
      sceneCaptureDate: string
      sceneId: string
      sceneSensorName: string
      status: string
      type: 'JOB'
    }
  }

  interface Algorithm {
    description: string
    id: string
    name: string
    requirements: AlgorithmRequirement[]
    type: string
    url: string
  }

  interface AlgorithmRequirement {
    name: string
    description: string
    literal: string
  }

  interface Job extends GeoJSON.Feature<GeoJSON.Polygon> {
    id: string
    properties: x.JobProperties
  }

  interface ProductLine extends GeoJSON.Feature<GeoJSON.Polygon> {
    id: string
    properties: x.ProductLineProperties
  }

  interface Scene extends GeoJSON.Feature<GeoJSON.Polygon> {
    id: string
    properties: SceneMetadata
  }

  interface SceneMetadata {
    type: 'SCENE'
    acquiredDate: string
    bands: {
      [key: string]: string
    }
    cloudCover: number
    link: string  // HACK -- Can be removed after Redmine #7621 is resolved
    path: string
    resolution: number
    sensorName: string
    thumb_large: string
    thumb_small: string
  }

  interface ImageryCatalogPage {
    count: number
    startIndex: number
    totalCount: number
    images: GeoJSON.FeatureCollection<any>
  }
}

//
// Webpack API
//

interface BuildEnvironment {
  NODE_ENV: string
  GATEWAY: string
  CLASSIFICATION_BANNER_BACKGROUND: string
  CLASSIFICATION_BANNER_FOREGROUND: string
  CLASSIFICATION_BANNER_TEXT: string
}

declare const process: {
  env: BuildEnvironment
}

declare var require: {
  (path: string)
  context(path: string, recursive: boolean, pattern: RegExp): any
}

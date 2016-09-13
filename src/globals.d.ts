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
      sceneCloudCover: number
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
}

declare const process: {
  env: BuildEnvironment
}

declare var require: {
  (path: string)
  context(path: string, recursive: boolean, pattern: RegExp): any
}

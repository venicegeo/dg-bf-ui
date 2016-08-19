declare namespace beachfront {
  namespace x {
    interface ProductLineProperties {
      algorithmName: string
      createdOn: string
      detectionsLayerId: string
      eventTypeId: string
      expiresOn: string
      imageCloudCover: number
      imageSensorName: string
      name: string
      owner: string
      spatialFilterName: string
      startsOn: string
      status: string
      type: 'PRODUCT_LINE'
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
    bands: {
      [key: string]: string
    }
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

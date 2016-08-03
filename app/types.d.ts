declare namespace beachfront {
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

declare function require(path: string)

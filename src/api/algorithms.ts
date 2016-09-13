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

import {Client} from '../utils/piazza-client'
import {GATEWAY} from '../config'
import {
  REQUIREMENT_BANDS,
  REQUIREMENT_CLOUDCOVER,
} from '../constants'

const PATTERN_REQUIREMENT_PREFIX = /^ImgReq - /
const PATTERN_NAME_PREFIX = /^BF_Algo_/

export function discover(sessionToken): Promise<beachfront.Algorithm[]> {
  console.debug('(algorithms:discover)')
  const client = new Client(GATEWAY, sessionToken)
  return client.getServices({pattern: PATTERN_NAME_PREFIX.source})
    .then(algorithms => algorithms.map(normalizeAlgorithm))
    .catch(err => {
      console.error('(algorithms:discoverAlgorithms) discovery failed:', err)
      throw err
    })
}

//
// Helpers
//

function extractRequirements(metadata) {
  const requirements = []
  if (metadata) {
    Object.keys(metadata).forEach(key => {
      if (PATTERN_REQUIREMENT_PREFIX.test(key)) {
        requirements.push(normalizeRequirement(key, metadata[key]))
      }
    })
  }
  return requirements
}

function normalizeRequirement(key, value): beachfront.AlgorithmRequirement {
  let name = key.replace(PATTERN_REQUIREMENT_PREFIX, '')
  let description = value.trim()
  switch (name) {
    case 'bands':
      name = REQUIREMENT_BANDS
      description = description.toUpperCase().split(',').join(' and ')
      break
    case 'cloudCover':
      name = REQUIREMENT_CLOUDCOVER
      description = `Less than ${description}%`
      value = parseFloat(value)
      break
    default:
      break
  }
  return {name, description, literal: value}
}

function normalizeAlgorithm(serviceDescriptor): beachfront.Algorithm {
  return {
    description:  serviceDescriptor.resourceMetadata.description,
    id:           serviceDescriptor.serviceId,
    name:         serviceDescriptor.resourceMetadata.name.replace(PATTERN_NAME_PREFIX, ''),
    requirements: extractRequirements(serviceDescriptor.resourceMetadata.metadata),
    type:         serviceDescriptor.resourceMetadata.metadata.Interface,
    url:          serviceDescriptor.url,
  }
}

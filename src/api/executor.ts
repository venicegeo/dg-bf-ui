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

const PATTERN_NAME_PREFIX = /^bf-handle/

export interface ServiceDescriptor {
  error?: any
  serviceId?: string
  url?: string
}

export function discover(sessionToken): Promise<ServiceDescriptor> {
  console.debug('(executor:discover)')
  const client = new Client(GATEWAY, sessionToken)
  return client.getServices({pattern: PATTERN_NAME_PREFIX.source})
    .then(([executor]) => {
      if (!executor) {
        throw new Error('Could not find Beachfront API service')
      }
      return {
        serviceId: executor.serviceId,
        url:       executor.url.replace(/\/execute$/, ''),
      }
    })
    .catch(err => {
      console.error('(executor:discover) discovery failed:', err)
    })
}

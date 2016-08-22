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

import expect from 'expect'
import * as config from '../app/config'

describe('config', () => {
  it('reads gateway URL from environment', () => {
    expect(config.GATEWAY).toEqual('/test-gateway')
  })

  it('defines jobs worker timing properties', () => {
    expect(config.JOBS_WORKER.INTERVAL).toBeA('number')
    expect(config.JOBS_WORKER.JOB_TTL).toBeA('number')
  })

  it('defines a schema version', () => {
    expect(config.SCHEMA_VERSION).toBeA('number')
  })

  it('defines at least one tile provider', () => {
    expect(config.TILE_PROVIDERS.length).toBeGreaterThan(0)
  })
})

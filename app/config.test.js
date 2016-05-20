import expect from 'expect'
import * as config from './config'

describe('config', () => {
  it('reads gateway URL from environment', () => {
    expect(config.GATEWAY).toEqual('/test-gateway')
  })

  it('defines jobs worker timing properties', () => {
    expect(config.JOBS_WORKER.POLL_INTERVAL).toBeA('number')
    expect(config.JOBS_WORKER.POLL_MAX_ATTEMPTS).toBeA('number')
  })

  it('defines at least one tile provider', () => {
    expect(config.TILE_PROVIDERS.length).toBeGreaterThan(0)
  })
})
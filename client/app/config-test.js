import * as config from './config'

describe('config', () => {
  it('reads gateway URL from environment', () => {
    expect(config.GATEWAY).toEqual('/test-gateway')
  })

  it('defines jobs worker timing properties', () => {
    expect(config.JOBS_WORKER).toContain('POLL_INTERVAL', 'POLL_MAX_ATTEMPTS')
  })

  it('defines at least one tile provider', () => {
    expect(config.TILE_PROVIDERS.length).toBeGreaterThan(0)
  })
})

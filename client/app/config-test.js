import {GATEWAY, TILE_PROVIDERS} from './config'

describe('config', () => {
  it('reads gateway URL from environment', () => {
    expect(GATEWAY).toEqual('/test-gateway')
  })

  it('defines at least one tile provider', () => {
    expect(TILE_PROVIDERS.length).toBeGreaterThan(0)
  })
})

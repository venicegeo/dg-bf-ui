import {API_NAMESPACE, TILE_PROVIDERS} from './config'

describe('config', () => {
  it('reads API namespace from environment', () => {
    expect(API_NAMESPACE).toEqual('/api/test')
  })

  it('defines at least one tile provider', () => {
    expect(TILE_PROVIDERS.length).toBeGreaterThan(0)
  })
})

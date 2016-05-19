export function list(/*client*/) {
  return Promise.resolve([
    new ImageComposite({name: 'LC80090472014280LGN00', ids: ['e32b37c5-dc6e-4c7b-b11e-81a23ebdbb0a', '2aab2e30-a612-4c5a-8351-324e57a9e993']}),
    new ImageComposite({name: 'LC80150442014002LGN00', ids: ['65bff6c1-62f4-41d6-a28b-aebb6cb56621', '9c1dc643-5ddd-4f9e-8a3b-6fbc93906a50']})
  ])
}

//
// Data Structures
//

class ImageComposite {
  constructor(raw) {
    this.name = raw.name
    this.ids = raw.ids
  }
}

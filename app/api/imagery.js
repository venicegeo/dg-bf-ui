export function list(/*client*/) {
  return Promise.resolve([
    new ImageComposite({name: 'CANNED_IMAGE_1', ids: ['1495f1e3-bb7d-43de-8a9f-629f7861e3f8', '905b82e7-c757-4283-b105-9ce7c8f894de']})
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

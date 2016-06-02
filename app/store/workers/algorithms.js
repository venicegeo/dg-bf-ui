const IMAGE_REQUIREMENT_PREFIX = 'imgReq - '

let cache

export function initialize(client) {
  return cacheWorker(client)
}

export function list() {
  // TODO -- filter by capability * image props
  return cache ? cache.slice() : []  // HACK
}

//
// Internals
//

function cacheWorker(client) {
  const handle = setInterval(work, 60000)
  const terminate = () => clearInterval(handle)
  work()

  function work() {
    console.debug('(algorithms:cacheWorker) updating')
    client.getServices({pattern: '^BF_Algo'})
      .then(services => {
        cache = services.map(a => new Algorithm(a))
      })
      .catch(err => {
        console.error('(algorithms:cacheWorker) update failed:', err)
      })
  }

  return {terminate}
}

//
// Data Structures
//

class Algorithm {
  constructor(service) {
    this.id = service.serviceId
    this.description = service.resourceMetadata.description
    this.name = service.resourceMetadata.name
    this.requirements = extractRequirements(service.resourceMetadata.metadata)
    this.url = service.url
  }
}

function extractRequirements(metadata) {
  const requirements = []
  if (metadata) {
    Object.keys(metadata).forEach(key => {
      if (key.indexOf(IMAGE_REQUIREMENT_PREFIX) === 0) {
        requirements.push(normalizeRequirement(key, metadata[key]))
      }
    })
  }
  return requirements
}

function normalizeRequirement(key, value) {
  let name = key.replace(IMAGE_REQUIREMENT_PREFIX, '')
  let description = value.trim()
  switch (name) {
  case 'Bands':
    description = description.split(',').join(' and ')
    break
  case 'CloudCover':
    name = 'Cloud Cover'
    description = `Less than ${description}`
    break
  default:
    break
  }
  return {name, description}
}

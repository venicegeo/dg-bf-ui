const IMAGE_REQUIREMENT_PREFIX = 'imgReq - '

export function list(client) {
  return client.getServices({pattern: '^BF_Algo'})
    .then(services => services.map(a => new Algorithm(a)))
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

const IMAGE_REQUIREMENT_PREFIX = 'ImgReq - '

let _client, _handlers, _instance

export function start(client, interval, {beforeFetch, onFailure, onTerminate, onUpdate, shouldRun}) {
  if (typeof _instance === 'number') {
    throw new Error('Attempted to start while already running')
  }
  _client = client
  _instance = setInterval(work, interval)
  _handlers = {beforeFetch, onFailure, onTerminate, onUpdate, shouldRun}
  work()
}

export function terminate() {
  clearInterval(_instance)
  _handlers.onTerminate()
  _instance = null
  _client = null
  _handlers = null
}

//
// Internals
//

function work() {
  if (!_handlers.shouldRun()) {
    console.debug('(algorithms:worker) fetch already in-flight; skipping cycle')
    return
  }
  console.debug('(algorithms:worker) updating')
  _handlers.beforeFetch()
  _client.getServices({pattern: '^BF_Algo'})
    .then(algorithms => {
      _handlers.onUpdate(algorithms.map(normalizeAlgorithm))
    })
    .catch(err => {
      _handlers.onFailure(err)
      terminate()
      console.error('(algorithms:worker) cycle failed; terminating.', err)
    })
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
  case 'bands':
    name = 'Bands'
    description = description.toUpperCase().split(',').join(' and ')
    break
  case 'cloudCover':
    name = 'Cloud Cover'
    description = `Less than ${description}%`
    break
  default:
    break
  }
  return {name, description, literal: value}
}

function normalizeAlgorithm(serviceDescriptor) {
  return {
    description:  serviceDescriptor.resourceMetadata.description,
    id:           serviceDescriptor.serviceId,
    name:         serviceDescriptor.resourceMetadata.name,
    requirements: extractRequirements(serviceDescriptor.resourceMetadata.metadata),
    url:          serviceDescriptor.url
  }
}

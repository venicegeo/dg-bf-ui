import {CancelablePromise} from './CancelablePromise'

export function fetchThumbnail(url) {
  const cancelable = new CancelablePromise((resolve, reject) => {
    const thumbnail = new Image()
    thumbnail.crossOrigin = 'Anonymous'
    thumbnail.onload = () => resolve(thumbnail)
    thumbnail.onerror = () => reject(new Error(`fetch failed (url=${url})`))
    thumbnail.src = url
  })

  // Ensure we don't process a cancelled fetch
  cancelable.promise.then(applyClippingMask)

  return cancelable
}

function applyClippingMask(image) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')

  // Set up for cleanup
  context.save()

  // Skew & rotate view
  context.setTransform(1, 0, 0, 1, canvas.width * 0.01, canvas.height * -0.035)
  context.beginPath()
  context.rotate(12.25 * (Math.PI / 180))

  // Draw mask
  context.rect(
    canvas.width * 0.178,
    canvas.height * 0,
    canvas.width * 0.83,
    canvas.height * 0.83
  )
  context.clip()

  // Inject image
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  // Export masked image
  image.src = canvas.toDataURL('image/png')

  // Clean up
  context.restore()

  return image
}

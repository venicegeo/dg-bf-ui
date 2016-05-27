export function debounce(fn, duration = 100) {
  let handle
  return (...args) => {
    clearTimeout(handle)
    handle = setTimeout(() => fn(...args), duration)
  }
}

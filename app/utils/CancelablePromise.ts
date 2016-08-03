export class CancelablePromise {
  constructor(callback) {
    let canceled
    this.cancel = () => canceled = true
    this.promise = new Promise((resolve, reject) => {
      return callback(resolve, reject)
    }).then(value => {
      if (canceled) {
        throw new Cancellation()
      }
      return value
    })
  }

  static wrap(promise) {
    return new CancelablePromise((resolve, reject) => promise.then(resolve, reject))
  }
}

export class Cancellation {
  get isCancellation() {
    return true
  }
}

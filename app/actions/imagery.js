import moment from 'moment'
import {CATALOG} from '../config'

export function searchForImagery(client, apiKey, bbox, dateFrom /*, dateTo*/) {
  const date = moment(dateFrom).toISOString()
  return fetch(`${CATALOG}/discover?acquiredDate=${date}&bbox=${bbox}&cloudCover=1`)
    .then(response => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('HTTP Error ' + response.status)
    })
}

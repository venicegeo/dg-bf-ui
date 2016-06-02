import moment from 'moment'

export function search(client, apiKey, bbox, dateFrom /*, dateTo*/) {
  const url = client.gateway.replace('pz-gateway', 'pzsvc-image-catalog')
    + '/discover'
    + '?bbox=' + bbox.join(',')
    + '&cloudCover=1'
    + '&acquiredDate=' + moment(dateFrom).toISOString()
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('HTTP Error ' + response.status)
    })
}

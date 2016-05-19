const express    = require('express')
const request    = require('request')
const bodyParser = require('body-parser')
const morgan     = require('morgan')

const PROTOCOL    = process.env.PROTOCOL || 'https'
const DOMAIN      = process.env.DOMAIN || 'localhost:3000'
const PORT        = process.env.PORT || 5000
const STATIC_ROOT = process.env.STATIC_ROOT || `${__dirname}/public`
const LOG_FORMAT  = 'remote_ip=:remote-addr, remote_user=:remote-user, method=:method, uri=:url, status=:status, sent=:res[content-length] bytes, referer=:referrer, err=:err'
const GATEWAY     = `${PROTOCOL}://${DOMAIN}`

const app = express()
app.use(bodyParser.raw({type: '*/*'}))
app.use(express.static(STATIC_ROOT))
app.use(morgan(LOG_FORMAT))

morgan.token('err', (req) => req.err)

//
// Forwarder
//

app.all('/gateway/*', (req, res) => {
  const outbound = {
    baseUrl: GATEWAY,
    headers: Object.assign({}, req.headers, {host: DOMAIN}),
    method: req.method,
    uri: req.url.substr(8),
  }
  if (req.method === 'POST') {
    outbound.body = req.body
  }
  request(outbound)
    .on('error', (err) => {
      req.err = err
      res.status(502).end('Bad Gateway')
    })
    .pipe(res)
})

//
// History API fallback
//

app.get('*', (req, res) => {
  res.sendFile(`${STATIC_ROOT}/index.html`)
})

console.log('-'.repeat(80))
console.log('Beachfront\n')
console.log('gateway     : %s', GATEWAY)
console.log('static root : %s', STATIC_ROOT)
console.log('port        : %s', PORT)
console.log('-'.repeat(80))
app.listen(PORT)
